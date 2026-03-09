"use server"

import { logAuditEvent } from "@/lib/audit-logger"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const courseSchema = z.object({
    code: z.string().min(2, "Course code is required").max(20),
    name: z.string().min(2, "Course name is required").max(200),
    description: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
    institutionId: z.string().min(1, "Institution is required"),
    lecturerId: z.string().nullable().optional(),
    creditHours: z.coerce.number().min(1).max(12).default(3),
})

const updateCourseSchema = courseSchema.partial()

const scheduleSchema = z.object({
    dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:MM format"),
    roomName: z.string().max(100).optional(),
})

async function requireAdmin() {
    const session = await auth()
    const role = session?.user?.role
    if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
        throw new Error("Unauthorized: Admin access required.")
    }
    return session
}

async function requireAuth() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

export type CourseRow = {
    id: string
    code: string
    name: string
    description: string | null
    departmentId: string
    institutionId: string
    lecturerId: string | null
    lecturerName: string | null
    creditHours: number
    status: string
    studentCount: number
    createdAt: string
}

export type CourseScheduleRow = {
    id: string
    courseId: string
    dayOfWeek: string
    startTime: string
    endTime: string
    roomName: string | null
}

// ── Courses ──────────────────────────────────────────────────────────────────

export async function getCourses() {
    const session = await requireAuth()
    const userId = session.user?.id
    const isLecturer = session.user?.role === "LECTURER"
    try {
        const rows = await withDb(async (db) => {
            const params: string[] = []
            let whereClause = ""
            if (isLecturer && userId) {
                whereClause = `WHERE c.lecturer_id = $1`
                params.push(userId)
            }
            const result = await db.query(`
                SELECT
                    c.id,
                    c.code,
                    c.name,
                    c.description,
                    c.department_id AS "departmentId",
                    c.institution_id AS "institutionId",
                    c.lecturer_id AS "lecturerId",
                    c.credit_hours AS "creditHours",
                    c.status,
                    c.created_at AS "createdAt",
                    CONCAT(u.first_name, ' ', u.last_name) AS "lecturerName",
                    COUNT(ce.student_id)::int AS "studentCount"
                FROM courses c
                LEFT JOIN users u ON c.lecturer_id = u.id
                LEFT JOIN student_courses ce ON c.id = ce.course_id
                ${whereClause}
                GROUP BY c.id, u.first_name, u.last_name
                ORDER BY c.created_at DESC
            `, params)
            return result.rows
        })
        return { success: true, data: rows as CourseRow[] }
    } catch (error) {
        console.error("Failed to fetch courses:", error)
        return { success: false, error: "Failed to fetch courses" }
    }
}

export async function createCourse(data: z.infer<typeof courseSchema>) {
    await requireAdmin()
    try {
        const v = courseSchema.parse(data)

        const row = await withDb(async (db) => {
            const existing = await db.query("SELECT id FROM courses WHERE code=$1", [v.code])
            if (existing.rows.length > 0) return { error: "exists" }

            const result = await db.query(`
                INSERT INTO courses (id, code, name, description, department_id, institution_id, lecturer_id, credit_hours, status, updated_at)
                VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,'ACTIVE',NOW())
                RETURNING id, code, name, status
            `, [v.code, v.name, v.description ?? null, v.departmentId, v.institutionId, v.lecturerId ?? '', v.creditHours])

            if (!result.rows[0]) return { error: "no rows returned" }
            return result.rows[0]
        })

        if (!row || "error" in row) {
            if (row?.error === "exists") return { success: false, error: "Course code already exists" }
            return { success: false, error: "Failed to create course" }
        }

        await logAuditEvent({
            userId: (await auth())?.user?.id ?? null,
            action: "CREATE",
            entityType: "COURSE",
            entityId: row.id,
            details: { code: v.code, name: v.name },
        })

        revalidatePath("/dashboard/courses")
        return { success: true, data: row }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || "Validation failed" }
        }
        console.error("Failed to create course:", error)
        return { success: false, error: "Failed to create course" }
    }
}

export async function updateCourse(id: string, data: z.infer<typeof updateCourseSchema>) {
    await requireAdmin()
    try {
        const v = updateCourseSchema.parse(data)
        const sets: string[] = []
        const vals: unknown[] = []
        let idx = 1
        if (v.code !== undefined) { sets.push(`code=$${idx++}`); vals.push(v.code) }
        if (v.name !== undefined) { sets.push(`name=$${idx++}`); vals.push(v.name) }
        if (v.description !== undefined) { sets.push(`description=$${idx++}`); vals.push(v.description) }
        if (v.lecturerId !== undefined) { sets.push(`lecturer_id=$${idx++}`); vals.push(v.lecturerId) }
        if (v.creditHours !== undefined) { sets.push(`credit_hours=$${idx++}`); vals.push(v.creditHours) }
        sets.push(`updated_at=NOW()`)
        vals.push(id)
        await withDb(db => db.query(`UPDATE courses SET ${sets.join(", ")} WHERE id=$${idx}`, vals))

        await logAuditEvent({
            userId: (await auth())?.user?.id ?? null,
            action: "UPDATE",
            entityType: "COURSE",
            entityId: id,
            details: { updatedFields: Object.keys(v) },
        })

        revalidatePath("/dashboard/courses")
        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false, error: error.issues[0]?.message || "Validation failed" }
        console.error("Failed to update course:", error)
        return { success: false, error: "Failed to update course" }
    }
}

export async function deleteCourse(id: string) {
    await requireAdmin()
    try {
        await withDb(db => db.query("DELETE FROM courses WHERE id=$1", [id]))

        await logAuditEvent({
            userId: (await auth())?.user?.id ?? null,
            action: "DELETE",
            entityType: "COURSE",
            entityId: id,
        })

        revalidatePath("/dashboard/courses")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete course:", error)
        return { success: false, error: "Failed to delete course" }
    }
}

export async function getLecturers() {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(
                `SELECT id, first_name AS "firstName", last_name AS "lastName", email
                FROM users WHERE role='LECTURER' AND status='ACTIVE' ORDER BY first_name`
            )
            return result.rows
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to fetch lecturers:", error)
        return { success: false, error: "Failed to fetch lecturers" }
    }
}

export async function getInstitutions() {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(
                `SELECT id, name, code FROM institutions WHERE status='ACTIVE' ORDER BY name`
            )
            return result.rows
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to fetch institutions:", error)
        return { success: false, error: "Failed to fetch institutions" }
    }
}

export async function getDepartmentsByInstitution(institutionId: string) {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(
                `SELECT id, name, code FROM departments WHERE institution_id=$1 ORDER BY name`,
                [institutionId]
            )
            return result.rows
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to fetch departments:", error)
        return { success: false, error: "Failed to fetch departments" }
    }
}

// ── Course Schedules ──────────────────────────────────────────────────────────

export async function getCourseSchedules(courseId: string) {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(
                `SELECT s.id, s.course_id AS "courseId", s.day_of_week AS "dayOfWeek",
                s.start_time AS "startTime", s.end_time AS "endTime", r.name AS "roomName"
                FROM schedules s
                LEFT JOIN rooms r ON s.room_id = r.id
                WHERE s.course_id=$1
                ORDER BY CASE s.day_of_week WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6 ELSE 7 END`,
                [courseId]
            )
            return result.rows
        })
        return { success: true, data: rows as CourseScheduleRow[] }
    } catch (error) {
        console.error("Failed to fetch course schedules:", error)
        return { success: false, error: "Failed to fetch schedules" }
    }
}

export async function addCourseSchedule(courseId: string, data: z.infer<typeof scheduleSchema>) {
    const session = await requireAdmin()
    try {
        const v = scheduleSchema.parse(data)
        const row = await withDb(async (db) => {
            let roomId = null;
            if (v.roomName) {
                const roomRes = await db.query("SELECT id FROM rooms WHERE name = $1 LIMIT 1", [v.roomName]);
                if (roomRes.rows.length > 0) roomId = roomRes.rows[0].id;
            }
            const result = await db.query(
                `INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time, room_id, updated_at)
                VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,NOW())
                RETURNING id, course_id AS "courseId", day_of_week AS "dayOfWeek",
                start_time AS "startTime", end_time AS "endTime"`,
                [courseId, v.dayOfWeek, v.startTime, v.endTime, roomId]
            )
            return { ...result.rows[0], roomName: v.roomName };
        })

        logAuditEvent({
            userId: session.user.id,
            action: "UPDATE",
            entityType: "COURSE",
            entityId: courseId,
            details: {
                action: "Added schedule",
                dayOfWeek: v.dayOfWeek,
                time: `${v.startTime}-${v.endTime}`
            }
        })

        revalidatePath("/dashboard/courses")
        revalidatePath("/dashboard/schedule")
        return { success: true, data: row }
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false, error: error.issues[0]?.message || "Validation failed" }
        console.error("Failed to add schedule:", error)
        return { success: false, error: "Failed to add schedule" }
    }
}

export async function deleteCourseSchedule(scheduleId: string) {
    await requireAdmin()
    try {
        await withDb(db => db.query("DELETE FROM schedules WHERE id=$1", [scheduleId]))
        revalidatePath("/dashboard/courses")
        revalidatePath("/dashboard/schedule")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete schedule:", error)
        return { success: false, error: "Failed to delete schedule" }
    }
}

// ── Course Enrollment ─────────────────────────────────────────────────────────

export async function getCourseStudents(courseId: string) {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(`
                SELECT
                    s.id,
                    s.student_id AS "studentRefId",
                    s.first_name AS "firstName",
                    s.last_name AS "lastName",
                    s.email,
                    s.face_enrolled AS "faceEnrolled",
                    s.status,
                    ce.enrolled_at AS "enrolledAt",
                    COUNT(ar.id)::int AS "totalSessions",
                    COUNT(CASE WHEN ar.status='PRESENT' THEN 1 END)::int AS "presentCount"
                FROM student_courses ce
                JOIN students s ON ce.student_id = s.id
                LEFT JOIN attendance_sessions asess ON asess.course_id::text = ce.course_id::text
                LEFT JOIN attendance_records ar ON ar.session_id = asess.id AND ar.student_id = s.id
                WHERE ce.course_id::text = $1::text
                GROUP BY s.id, ce.enrolled_at
                ORDER BY s.last_name, s.first_name
            `, [courseId])
            return result.rows
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to fetch course students:", error)
        return { success: false, error: "Failed to fetch students" }
    }
}

export async function getStudentsNotInCourse(courseId: string) {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(`
                SELECT s.id, s.student_id AS "studentRefId", s.first_name AS "firstName",
                s.last_name AS "lastName", s.email, s.face_enrolled AS "faceEnrolled"
                FROM students s
                WHERE s.status='ACTIVE'
                AND s.id NOT IN (
                    SELECT student_id FROM student_courses WHERE course_id::text = $1::text
                )
                ORDER BY s.last_name, s.first_name
            `, [courseId])
            return result.rows
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to fetch unenrolled students:", error)
        return { success: false, error: "Failed to fetch students" }
    }
}

export async function enrollStudentsInCourse(courseId: string, studentIds: string[]) {
    await requireAdmin()
    try {
        let enrolled = 0
        let alreadyEnrolled = 0
        await withDb(async (db) => {
            for (const studentId of studentIds) {
                const check = await db.query(
                    "SELECT id FROM student_courses WHERE course_id::text = $1::text AND student_id = $2",
                    [courseId, studentId]
                )
                if (check.rows.length > 0) {
                    alreadyEnrolled++
                } else {
                    await db.query(
                        "INSERT INTO student_courses (course_id, student_id) VALUES ($1, $2)",
                        [courseId, studentId]
                    )
                    enrolled++
                }
            }
        })
        revalidatePath(`/dashboard/courses/${courseId}/enrollment`)
        revalidatePath("/dashboard/courses")
        return { success: true, data: { enrolled, alreadyEnrolled } }
    } catch (error) {
        console.error("Failed to enroll students:", error)
        return { success: false, error: "Failed to enroll students" }
    }
}

export async function unenrollStudentFromCourse(courseId: string, studentId: string) {
    await requireAdmin()
    try {
        await withDb(db => db.query(
            "DELETE FROM student_courses WHERE course_id::text = $1::text AND student_id = $2",
            [courseId, studentId]
        ))
        revalidatePath(`/dashboard/courses/${courseId}/enrollment`)
        revalidatePath("/dashboard/courses")
        return { success: true }
    } catch (error) {
        console.error("Failed to unenroll student:", error)
        return { success: false, error: "Failed to unenroll student" }
    }
}
