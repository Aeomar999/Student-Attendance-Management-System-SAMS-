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
            // 1. Get actual attendance sessions within range
            const attendanceRes = await db.query(`
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
            `, [startDate, endDate])

            const actualSessions = attendanceRes.rows.map(row => ({
                id: row.id,
                courseCode: row.courseCode,
                courseName: row.courseName,
                lecturerName: row.lecturerName,
                sessionDate: new Date(row.sessionDate).toISOString().split('T')[0],
                startTime: new Date(row.startTime).toISOString(),
                endTime: row.endTime ? new Date(row.endTime).toISOString() : null,
                status: row.status,
                totalPresent: row.totalPresent,
                totalAbsent: row.totalAbsent
            })) as ScheduleSession[]

            // 2. Get all recurring schedules
            const scheduleRes = await db.query(`
                SELECT
                    s.id,
                    c.code AS "courseCode",
                    c.name AS "courseName",
                    CONCAT(u.first_name, ' ', u.last_name) AS "lecturerName",
                    s.day_of_week AS "dayOfWeek",
                    s.start_time AS "startTime",
                    s.end_time AS "endTime"
                FROM schedules s
                JOIN courses c ON s.course_id = c.id::text
                LEFT JOIN users u ON c.lecturer_id = u.id
                WHERE c.status = 'ACTIVE'
            `)

            const recurringSchedules = scheduleRes.rows

            // 3. Map recurring schedules to dates within the requested range
            const start = new Date(startDate)
            const end = new Date(endDate)
            const projectedSessions: ScheduleSession[] = []

            // Convert string day to JS Date.getDay() format (0=Sun, 1=Mon, ..., 6=Sat)
            const dayMap: Record<string, number> = {
                "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
                "Thursday": 4, "Friday": 5, "Saturday": 6
            }

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const currentDayName = Object.keys(dayMap).find(k => dayMap[k] === d.getDay())
                if (!currentDayName) continue;

                const dateString = d.toISOString().split('T')[0] as string

                // Find schedules for this day of week
                const schedulesForDay = recurringSchedules.filter(s => s.dayOfWeek === currentDayName)

                for (const sched of schedulesForDay) {
                    // Check if an actual attendance session already exists for this course on this day
                    const hasActual = actualSessions.some(act =>
                        act.courseCode === sched.courseCode &&
                        act.sessionDate.includes(dateString)
                    )

                    // If no actual session, project the scheduled one
                    if (!hasActual) {
                        projectedSessions.push({
                            id: `proj-${sched.id}-${dateString}`,
                            courseCode: String(sched.courseCode),
                            courseName: String(sched.courseName),
                            lecturerName: sched.lecturerName ? String(sched.lecturerName) : null,
                            sessionDate: dateString,
                            startTime: `${dateString}T${sched.startTime || "00:00"}:00`,
                            endTime: sched.endTime ? `${dateString}T${sched.endTime}:00` : null,
                            status: "SCHEDULED",
                            totalPresent: 0,
                            totalAbsent: 0
                        })
                    }
                }
            }

            // 4. Merge and sort
            const combined = [...actualSessions, ...projectedSessions]
            combined.sort((a, b) => {
                if (a.sessionDate !== b.sessionDate) {
                    return a.sessionDate.localeCompare(b.sessionDate)
                }
                return a.startTime.localeCompare(b.startTime)
            })

            return combined
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to fetch schedule:", error)
        return { success: false, error: "Failed to fetch schedule" }
    }
}
