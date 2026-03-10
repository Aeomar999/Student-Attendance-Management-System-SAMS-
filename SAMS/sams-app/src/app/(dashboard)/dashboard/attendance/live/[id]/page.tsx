import { notFound } from "next/navigation"
import { withDb } from "@/lib/db"
import { LiveSessionClient } from "./live-session-client"

export const metadata = {
    title: "Live Attendance Session - SAMS",
}

export default async function LiveSessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const sessionDetail = await withDb(async (db) => {
        const result = await db.query(`
            SELECT
                s.id, s.course_id AS "courseId",
                c.code AS "courseCode", c.name AS "courseName",
                CONCAT(u.first_name, ' ', u.last_name) AS "lecturerName",
                s.session_date AS "sessionDate",
                s.start_time AS "startTime",
                s.end_time AS "endTime",
                s.status,
                COALESCE(s.grace_period, 15) AS "gracePeriod"
            FROM attendance_sessions s
            LEFT JOIN courses c ON s.course_id = c.id::text
            LEFT JOIN users u ON s.lecturer_id = u.id
            WHERE s.id = $1
        `, [id])
        return result.rows[0]
    })

    if (!sessionDetail) return notFound()

    return (
        <LiveSessionClient session={sessionDetail} />
    )
}
