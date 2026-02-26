"use server"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"

async function requireAuth() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

/**
 * Exports attendance records as CSV text.
 * If sessionId is provided, exports only that session's records.
 * Otherwise exports all records (scoped by lecturer role).
 */
export async function exportAttendanceCSV(sessionId?: string): Promise<{ success: boolean; csv?: string; error?: string }> {
    const session = await requireAuth()
    const userId = session.user?.id
    const isLecturer = session.user?.role === "LECTURER"

    try {
        const csv = await withDb(async (db) => {
            let query = `
                SELECT
                    c.code AS "Course Code",
                    c.name AS "Course Name",
                    s.session_date AS "Session Date",
                    st.student_id AS "Student ID",
                    CONCAT(st.first_name, ' ', st.last_name) AS "Student Name",
                    st.email AS "Email",
                    ar.status AS "Status",
                    ar.recognized_at AS "Recognized At",
                    ar.is_manual AS "Manual Entry"
                FROM attendance_records ar
                JOIN attendance_sessions s ON ar.session_id = s.id
                JOIN courses c ON s.course_id = c.id::text
                JOIN students st ON ar.student_id = st.id
            `
            const params: string[] = []
            const conditions: string[] = []

            if (sessionId) {
                conditions.push(`ar.session_id = $${params.length + 1}`)
                params.push(sessionId)
            }

            if (isLecturer && userId) {
                conditions.push(`s.lecturer_id = $${params.length + 1}`)
                params.push(userId)
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(" AND ")}`
            }

            query += ` ORDER BY s.session_date DESC, st.last_name, st.first_name`

            const result = await db.query(query, params)

            if (result.rows.length === 0) return "No records found"

            const headers = Object.keys(result.rows[0]!).join(",")
            const rows = result.rows.map((row: Record<string, unknown>) =>
                Object.values(row).map(val =>
                    typeof val === "string" && val.includes(",") ? `"${val}"` : String(val ?? "")
                ).join(",")
            )
            return [headers, ...rows].join("\n")
        })
        return { success: true, csv }
    } catch (error) {
        console.error("Failed to export attendance CSV:", error)
        return { success: false, error: "Failed to export data" }
    }
}

/**
 * Exports the full student list as CSV.
 */
export async function exportStudentsCSV(): Promise<{ success: boolean; csv?: string; error?: string }> {
    await requireAuth()
    try {
        const csv = await withDb(async (db) => {
            const result = await db.query(`
                SELECT
                    student_id AS "Student ID",
                    first_name AS "First Name",
                    last_name AS "Last Name",
                    email AS "Email",
                    program AS "Program",
                    year_of_study AS "Year",
                    status AS "Status",
                    face_enrolled AS "Face Enrolled",
                    created_at AS "Created At"
                FROM students
                ORDER BY last_name, first_name
            `)

            if (result.rows.length === 0) return "No students found"

            const headers = Object.keys(result.rows[0]!).join(",")
            const rows = result.rows.map((row: Record<string, unknown>) =>
                Object.values(row).map(val =>
                    typeof val === "string" && val.includes(",") ? `"${val}"` : String(val ?? "")
                ).join(",")
            )
            return [headers, ...rows].join("\n")
        })
        return { success: true, csv }
    } catch (error) {
        console.error("Failed to export students CSV:", error)
        return { success: false, error: "Failed to export students" }
    }
}

/**
 * Exports audit logs as CSV.
 */
export async function exportAuditLogsCSV(): Promise<{ success: boolean; csv?: string; error?: string }> {
    await requireAuth()
    try {
        const csv = await withDb(async (db) => {
            const result = await db.query(`
                SELECT
                    al.action AS "Action",
                    al.entity_type AS "Entity Type",
                    al.entity_id AS "Entity ID",
                    CONCAT(u.first_name, ' ', u.last_name) AS "User",
                    u.email AS "User Email",
                    al.created_at AS "Timestamp"
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                ORDER BY al.created_at DESC
                LIMIT 5000
            `)

            if (result.rows.length === 0) return "No audit logs found"

            const headers = Object.keys(result.rows[0]!).join(",")
            const rows = result.rows.map((row: Record<string, unknown>) =>
                Object.values(row).map(val =>
                    typeof val === "string" && val.includes(",") ? `"${val}"` : String(val ?? "")
                ).join(",")
            )
            return [headers, ...rows].join("\n")
        })
        return { success: true, csv }
    } catch (error) {
        console.error("Failed to export audit logs CSV:", error)
        return { success: false, error: "Failed to export audit logs" }
    }
}
