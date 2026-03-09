"use server"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { logAuditEvent } from "@/lib/audit-logger"

const sessionSchema = z.object({
    courseId: z.string().min(1, "Course is required"),
    sessionDate: z.string().min(1, "Session date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().optional(),
    gracePeriod: z.coerce.number().min(0).max(120).default(15),
})

async function requireAuth() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

export type AttendanceSessionRow = {
    id: string
    courseId: string
    courseCode: string
    courseName: string
    lecturerId: string | null
    lecturerName: string | null
    sessionDate: string
    startTime: string
    endTime: string | null
    status: string
    gracePeriod: number
    totalPresent: number
    totalAbsent: number
    createdAt: string
}

export type AttendanceRecordRow = {
    id: string
    sessionId: string
    studentId: string
    studentRefId: string
    studentName: string
    email: string
    status: string
    recognizedAt: string | null
    confidenceScore: number | null
    isManual: boolean
    manualReason: string | null
}

export async function getAttendanceSessions() {
    const session = await requireAuth()
    const userId = session.user?.id
    const isLecturer = session.user?.role === "LECTURER"
    try {
        const rows = await withDb(async (db) => {
            const params: string[] = []
            let whereClause = ""
            if (isLecturer && userId) {
                whereClause = `WHERE s.lecturer_id = $1`
                params.push(userId)
            }
            const result = await db.query(`
                SELECT
                    s.id, s.course_id AS "courseId",
                    c.code AS "courseCode", c.name AS "courseName",
                    s.lecturer_id AS "lecturerId",
                    CONCAT(u.first_name, ' ', u.last_name) AS "lecturerName",
                    s.session_date AS "sessionDate",
                    s.start_time AS "startTime",
                    s.end_time AS "endTime",
                    s.status,
                    COALESCE(s.grace_period, 15) AS "gracePeriod",
                    s.total_present AS "totalPresent",
                    s.total_absent AS "totalAbsent",
                    s.created_at AS "createdAt"
                FROM attendance_sessions s
                LEFT JOIN courses c ON s.course_id = c.id::text
                LEFT JOIN users u ON s.lecturer_id = u.id
                ${whereClause}
                ORDER BY s.session_date DESC, s.start_time DESC
                LIMIT 200
            `, params)
            return result.rows
        })
        return { success: true, data: rows as AttendanceSessionRow[] }
    } catch (error) {
        console.error("Failed to fetch attendance sessions:", error)
        return { success: false, error: "Failed to fetch attendance sessions" }
    }
}

export async function getAttendanceStats() {
    const session = await requireAuth()
    const userId = session.user?.id
    const isLecturer = session.user?.role === "LECTURER"
    try {
        const stats = await withDb(async (db) => {
            const lecturerFilter = isLecturer && userId ? `WHERE s.lecturer_id = '${userId}'` : ""
            const recordFilter = isLecturer && userId
                ? `WHERE ar.session_id IN (SELECT id FROM attendance_sessions WHERE lecturer_id = '${userId}')`
                : ""
            const [sessions, records, present, courses] = await Promise.all([
                db.query(`SELECT COUNT(*) FROM attendance_sessions s ${lecturerFilter}`),
                db.query(`SELECT COUNT(*) FROM attendance_records ar ${recordFilter}`),
                db.query(`SELECT COUNT(*) FROM attendance_records ar ${recordFilter ? recordFilter + " AND ar.status='PRESENT'" : "WHERE status='PRESENT'"}`),
                db.query(`SELECT COUNT(DISTINCT course_id) FROM attendance_sessions s ${lecturerFilter}`),
            ])
            const totalRecords = parseInt(records.rows[0].count)
            const totalPresent = parseInt(present.rows[0].count)
            return {
                totalSessions: parseInt(sessions.rows[0].count),
                totalRecords,
                totalPresent,
                attendanceRate: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
                activeCourses: parseInt(courses.rows[0].count),
            }
        })
        return { success: true, data: stats }
    } catch (error) {
        console.error("Failed to fetch attendance stats:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}

export async function createAttendanceSession(data: z.infer<typeof sessionSchema>) {
    const authSession = await requireAuth()

    // Guard: lecturer_id is NOT NULL in the DB — catch missing user id early
    const lecturerId = authSession.user?.id
    if (!lecturerId) {
        return { success: false, error: "Could not identify the current user. Please sign out and sign in again." }
    }

    try {
        const v = sessionSchema.parse(data)

        // Build a proper timestamp for start_time by combining sessionDate + startTime
        const startDt = new Date(`${v.sessionDate}T${v.startTime}:00`)
        if (isNaN(startDt.getTime())) {
            return { success: false, error: "Invalid session date or start time provided." }
        }

        const row = await withDb(async (db) => {
            const result = await db.query(`
                INSERT INTO attendance_sessions
                (id, course_id, lecturer_id, session_date, start_time, end_time, status, grace_period, total_present, total_absent, updated_at)
                VALUES (gen_random_uuid(), $1, $2, $3::date, $4, $5, 'ACTIVE', $6, 0, 0, NOW())
                RETURNING id, status
            `, [v.courseId, lecturerId, v.sessionDate, startDt.toISOString(), null, v.gracePeriod])
            return result.rows[0]
        })

        await logAuditEvent({
            userId: lecturerId,
            action: "CREATE",
            entityType: "ATTENDANCE_SESSION",
            entityId: row.id,
            details: { message: `Created attendance session for course ${v.courseId}` }
        })

        revalidatePath("/dashboard/attendance")
        return { success: true, data: row }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message ?? "Validation failed" }
        }
        // Surface the real DB error message so failures are never silent
        const dbMessage = error instanceof Error ? error.message : String(error)
        console.error("Failed to create attendance session:", dbMessage)
        return { success: false, error: `Failed to create session: ${dbMessage}` }
    }
}

export async function closeAttendanceSession(sessionId: string) {
    const authSession = await requireAuth()
    try {
        await withDb(async (db) => {
            const present = await db.query(
                "SELECT COUNT(*) FROM attendance_records WHERE session_id=$1 AND status='PRESENT'",
                [sessionId]
            )
            const absent = await db.query(
                "SELECT COUNT(*) FROM attendance_records WHERE session_id=$1 AND status='ABSENT'",
                [sessionId]
            )
            await db.query(
                `UPDATE attendance_sessions SET status='COMPLETED', end_time=NOW(),
                total_present=$1, total_absent=$2, updated_at=NOW() WHERE id=$3`,
                [parseInt(present.rows[0].count), parseInt(absent.rows[0].count), sessionId]
            )
        })

        await logAuditEvent({
            userId: authSession.user?.id || null,
            action: "UPDATE",
            entityType: "ATTENDANCE_SESSION",
            entityId: sessionId,
            details: { message: `Closed attendance session ${sessionId}` }
        })

        revalidatePath("/dashboard/attendance")
        return { success: true }
    } catch (error) {
        console.error("Failed to close session:", error)
        return { success: false, error: "Failed to close session" }
    }
}

export async function getSessionRecords(sessionId: string) {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(`
                SELECT
                    ar.id, ar.session_id AS "sessionId",
                    ar.student_id AS "studentId",
                    st.student_id AS "studentRefId",
                    CONCAT(st.first_name, ' ', st.last_name) AS "studentName",
                    st.email,
                    ar.status,
                    ar.recognized_at AS "recognizedAt",
                    ar.confidence_score AS "confidenceScore",
                    ar.is_manual AS "isManual",
                    ar.manual_reason AS "manualReason"
                FROM attendance_records ar
                JOIN students st ON ar.student_id = st.id
                WHERE ar.session_id = $1
                ORDER BY st.last_name, st.first_name
            `, [sessionId])
            return result.rows
        })
        return { success: true, data: rows as AttendanceRecordRow[] }
    } catch (error) {
        console.error("Failed to fetch session records:", error)
        return { success: false, error: "Failed to fetch records" }
    }
}

export async function markAttendance(
    sessionId: string,
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
    reason?: string
) {
    await requireAuth()
    try {
        await withDb(async (db) => {
            await db.query(`
                INSERT INTO attendance_records (id, session_id, student_id, status, is_manual, manual_reason, recognized_at, updated_at)
                VALUES (gen_random_uuid(), $1, $2, $3, true, $4, $5, NOW())
                ON CONFLICT (session_id, student_id)
                DO UPDATE SET status=$3, is_manual=true, manual_reason=$4,
                recognized_at=$5, updated_at=NOW()
            `, [sessionId, studentId, status, reason ?? null, status === "PRESENT" ? new Date().toISOString() : null])
        })
        revalidatePath("/dashboard/attendance")
        return { success: true }
    } catch (error) {
        console.error("Failed to mark attendance:", error)
        return { success: false, error: "Failed to mark attendance" }
    }
}

export async function getCoursesForDropdown() {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(
                `SELECT id::text AS id, code, name FROM courses WHERE status='ACTIVE' ORDER BY code`
            )
            return result.rows
        })
        return { success: true, data: rows as { id: string; code: string; name: string }[] }
    } catch (error) {
        console.error("Failed to fetch courses:", error)
        return { success: false, error: "Failed to fetch courses" }
    }
}

export async function getStudentAttendanceHistory(studentId: string) {
    await requireAuth()
    try {
        const data = await withDb(async (db) => {
            const [student, summary, records] = await Promise.all([
                db.query(
                    `SELECT id, student_id AS "studentRefId", first_name AS "firstName", last_name AS "lastName",
                    email, face_enrolled AS "faceEnrolled", status, consent_given AS "consentGiven"
                    FROM students WHERE id=$1`,
                    [studentId]
                ),
                db.query(
                    `SELECT
                        COUNT(*)::int AS "totalSessions",
                        COUNT(CASE WHEN ar.status='PRESENT' THEN 1 END)::int AS "present",
                        COUNT(CASE WHEN ar.status='LATE' THEN 1 END)::int AS "late",
                        COUNT(CASE WHEN ar.status='ABSENT' THEN 1 END)::int AS "absent",
                        COUNT(CASE WHEN ar.status='EXCUSED' THEN 1 END)::int AS "excused"
                    FROM attendance_records ar WHERE ar.student_id=$1`,
                    [studentId]
                ),
                db.query(
                    `SELECT
                        ar.id,
                        ar.status,
                        ar.recognized_at AS "recognizedAt",
                        ar.is_manual AS "isManual",
                        ar.manual_reason AS "manualReason",
                        ar.confidence_score AS "confidenceScore",
                        s.id AS "sessionId",
                        s.session_date AS "sessionDate",
                        s.start_time AS "startTime",
                        c.code AS "courseCode",
                        c.name AS "courseName"
                    FROM attendance_records ar
                    JOIN attendance_sessions s ON ar.session_id = s.id
                    JOIN courses c ON s.course_id = c.id::text
                    WHERE ar.student_id=$1
                    ORDER BY s.session_date DESC, s.start_time DESC
                    LIMIT 200`,
                    [studentId]
                ),
            ])

            const statsRow = summary.rows[0]
            const total = statsRow.totalSessions
            const attended = statsRow.present + statsRow.late
            const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0

            return {
                student: student.rows[0],
                summary: { ...statsRow, attendanceRate },
                records: records.rows,
            }
        })
        return { success: true, data }
    } catch (error) {
        console.error("Failed to fetch student attendance history:", error)
        return { success: false, error: "Failed to fetch attendance history" }
    }
}
