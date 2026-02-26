"use server"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"

async function requireAuth() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

export type CourseAttendanceStats = {
    courseId: string
    courseCode: string
    courseName: string
    totalSessions: number
    totalRecords: number
    totalPresent: number
    attendanceRate: number
}

export type AtRiskStudent = {
    studentId: string
    studentRefId: string
    studentName: string
    email: string
    totalSessions: number
    presentCount: number
    attendanceRate: number
}

export type OverallStats = {
    totalStudents: number
    totalSessions: number
    totalRecords: number
    overallAttendanceRate: number
    faceEnrolledCount: number
    studentsAtRisk: number
}

export async function getOverallStats(): Promise<{ success: boolean; data?: OverallStats; error?: string }> {
    await requireAuth()
    try {
        const data = await withDb(async (db) => {
            const [students, sessions, records, present, enrolled, atRisk] = await Promise.all([
                db.query("SELECT COUNT(*) FROM students WHERE status='ACTIVE'"),
                db.query("SELECT COUNT(*) FROM attendance_sessions"),
                db.query("SELECT COUNT(*) FROM attendance_records"),
                db.query("SELECT COUNT(*) FROM attendance_records WHERE status='PRESENT'"),
                db.query("SELECT COUNT(*) FROM students WHERE face_enrolled=true"),
                db.query(`
                    SELECT COUNT(DISTINCT student_id) AS cnt FROM (
                        SELECT ar.student_id,
                            COUNT(*) FILTER (WHERE ar.status='PRESENT') * 100.0 / COUNT(*) AS rate
                        FROM attendance_records ar
                        GROUP BY ar.student_id
                        HAVING COUNT(*) >= 3
                    ) sub WHERE rate < 75
                `),
            ])
            const totalRecords = parseInt(records.rows[0].count)
            const totalPresent = parseInt(present.rows[0].count)
            return {
                totalStudents: parseInt(students.rows[0].count),
                totalSessions: parseInt(sessions.rows[0].count),
                totalRecords,
                overallAttendanceRate: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
                faceEnrolledCount: parseInt(enrolled.rows[0].count),
                studentsAtRisk: parseInt(atRisk.rows[0].cnt ?? 0),
            }
        })
        return { success: true, data }
    } catch (error) {
        console.error("Failed to get overall stats:", error)
        return { success: false, error: "Failed to load stats" }
    }
}

export async function getCourseAttendanceStats(): Promise<{ success: boolean; data?: CourseAttendanceStats[]; error?: string }> {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(`
                SELECT
                    c.id::text AS "courseId",
                    c.code AS "courseCode",
                    c.name AS "courseName",
                    COUNT(DISTINCT s.id)::int AS "totalSessions",
                    COUNT(ar.id)::int AS "totalRecords",
                    COUNT(ar.id) FILTER (WHERE ar.status='PRESENT')::int AS "totalPresent"
                FROM courses c
                LEFT JOIN attendance_sessions s ON s.course_id = c.id::text
                LEFT JOIN attendance_records ar ON ar.session_id = s.id
                GROUP BY c.id, c.code, c.name
                ORDER BY c.code
            `)
            return result.rows.map((row: CourseAttendanceStats & { totalRecords: number; totalPresent: number }) => ({
                ...row,
                attendanceRate: row.totalRecords > 0
                    ? Math.round((row.totalPresent / row.totalRecords) * 100)
                    : 0,
            }))
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to get course stats:", error)
        return { success: false, error: "Failed to load course stats" }
    }
}

export async function getAtRiskStudents(): Promise<{ success: boolean; data?: AtRiskStudent[]; error?: string }> {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(`
                SELECT
                    st.id AS "studentId",
                    st.student_id AS "studentRefId",
                    CONCAT(st.first_name, ' ', st.last_name) AS "studentName",
                    st.email,
                    COUNT(ar.id)::int AS "totalSessions",
                    COUNT(ar.id) FILTER (WHERE ar.status='PRESENT')::int AS "presentCount"
                FROM students st
                JOIN attendance_records ar ON ar.student_id = st.id
                GROUP BY st.id, st.student_id, st.first_name, st.last_name, st.email
                HAVING COUNT(ar.id) >= 3
                    AND (COUNT(ar.id) FILTER (WHERE ar.status='PRESENT') * 100.0 / COUNT(ar.id)) < 75
                ORDER BY (COUNT(ar.id) FILTER (WHERE ar.status='PRESENT') * 1.0 / COUNT(ar.id)) ASC
                LIMIT 50
            `)
            return result.rows.map((row: AtRiskStudent & { totalSessions: number; presentCount: number }) => ({
                ...row,
                attendanceRate: Math.round((row.presentCount / row.totalSessions) * 100),
            }))
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to get at-risk students:", error)
        return { success: false, error: "Failed to load at-risk students" }
    }
}
