import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { withDb } from "@/lib/db"
import { SessionDetailClient } from "./session-detail-client"

export const metadata: Metadata = {
    title: "Session Detail | SAMS",
    description: "View attendance session details",
}

interface SessionDetailRow {
    id: string
    courseId: string
    courseCode: string
    courseName: string
    lecturerName: string | null
    sessionDate: string
    startTime: string
    endTime: string | null
    status: string
    gracePeriod: number
    totalPresent: number
    totalAbsent: number
}

interface SessionRecordRow {
    id: string
    studentId: string
    studentRefId: string
    studentName: string
    email: string
    status: string
    recognizedAt: string | null
    confidenceScore: number | null
    isManual: boolean
}

async function getSessionData(sessionId: string) {
    return withDb(async (db) => {
        const sessionResult = await db.query(`
            SELECT
                s.id, s.course_id AS "courseId",
                c.code AS "courseCode", c.name AS "courseName",
                CONCAT(u.first_name, ' ', u.last_name) AS "lecturerName",
                s.session_date AS "sessionDate",
                s.start_time AS "startTime",
                s.end_time AS "endTime",
                s.status,
                COALESCE(s.grace_period, 15) AS "gracePeriod",
                s.total_present AS "totalPresent",
                s.total_absent AS "totalAbsent"
            FROM attendance_sessions s
            LEFT JOIN courses c ON s.course_id = c.id::text
            LEFT JOIN users u ON s.lecturer_id = u.id
            WHERE s.id = $1
        `, [sessionId])

        if (sessionResult.rows.length === 0) return null

        const recordsResult = await db.query(`
            SELECT
                ar.id,
                ar.student_id AS "studentId",
                st.student_id AS "studentRefId",
                CONCAT(st.first_name, ' ', st.last_name) AS "studentName",
                st.email,
                ar.status,
                ar.recognized_at AS "recognizedAt",
                ar.confidence_score AS "confidenceScore",
                ar.is_manual AS "isManual"
            FROM attendance_records ar
            JOIN students st ON ar.student_id = st.id
            WHERE ar.session_id = $1
            ORDER BY st.last_name, st.first_name
        `, [sessionId])

        return {
            session: sessionResult.rows[0] as SessionDetailRow,
            records: recordsResult.rows as SessionRecordRow[],
        }
    })
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const authSession = await auth()
    if (!authSession?.user) redirect("/login")

    const { id } = await params
    const data = await getSessionData(id)

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <h1 className="text-2xl font-bold">Session Not Found</h1>
                <p className="text-muted-foreground">The attendance session you requested does not exist.</p>
            </div>
        )
    }

    return <SessionDetailClient session={data.session} records={data.records} />
}
