"use server"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"

async function requireAuth() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

export type ScheduleSession = {
    id: string
    courseCode: string
    courseName: string
    lecturerName: string | null
    sessionDate: string
    startTime: string
    endTime: string | null
    status: string
    totalPresent: number
    totalAbsent: number
}

export async function getScheduleSessions(startDate: string, endDate: string): Promise<{
    success: boolean; data?: ScheduleSession[]; error?: string
}> {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(`
                SELECT
                    s.id,
                    c.code AS "courseCode",
                    c.name AS "courseName",
                    CONCAT(u.first_name, ' ', u.last_name) AS "lecturerName",
                    s.session_date AS "sessionDate",
                    s.start_time AS "startTime",
                    s.end_time AS "endTime",
                    s.status,
                    s.total_present AS "totalPresent",
                    s.total_absent AS "totalAbsent"
                FROM attendance_sessions s
                LEFT JOIN courses c ON s.course_id = c.id::text
                LEFT JOIN users u ON s.lecturer_id = u.id
                WHERE s.session_date >= $1 AND s.session_date <= $2
                ORDER BY s.session_date ASC, s.start_time ASC
            `, [startDate, endDate])
            return result.rows
        })
        return { success: true, data: rows as ScheduleSession[] }
    } catch (error) {
        console.error("Failed to fetch schedule:", error)
        return { success: false, error: "Failed to fetch schedule" }
    }
}
