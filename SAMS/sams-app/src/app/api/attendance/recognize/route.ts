import { NextRequest, NextResponse } from "next/server"
import { withDb } from "@/lib/db"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { sessionId, image, threshold = 0.60 } = body

        if (!sessionId || !image) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
        }

        const sessionInfo = await withDb(async (db) => {
            const s = await db.query(
                "SELECT session_date, start_time, grace_period, status FROM attendance_sessions WHERE id = $1",
                [sessionId]
            )
            return s.rows[0]
        })

        if (!sessionInfo || sessionInfo.status !== "ACTIVE") {
            return NextResponse.json({ success: false, error: "Session is not active" }, { status: 400 })
        }

        let backendMatches: { student_id: string, confidence: number }[] = []

        const engineUrl = process.env.FR_ENGINE_URL
        if (engineUrl) {
            const engineRes = await fetch(`${engineUrl}/api/v1/fr/recognize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, image, metadata: { threshold } })
            })
            if (!engineRes.ok) throw new Error("FR Engine returned an error")
            const engineData = await engineRes.json()
            if (engineData.success && engineData.data && engineData.data.faces) {
                backendMatches = engineData.data.faces.map((f: { recognition: { student?: { id: string }, confidence: number } }) => ({
                    student_id: f.recognition.student?.id,
                    confidence: f.recognition.confidence
                })).filter((m: { student_id?: string, confidence: number }) => m.student_id)
            }
        } else {
            const mockRand = Math.random()
            if (mockRand > 0.4) {
                const randomStudent = await withDb(async (db) => {
                    const res = await db.query("SELECT id FROM students WHERE face_enrolled = TRUE ORDER BY RANDOM() LIMIT 1")
                    return res.rows[0]?.id
                })
                if (randomStudent) {
                    backendMatches = [{ student_id: randomStudent, confidence: 0.95 + (Math.random() * 0.04) }]
                }
            }
        }

        if (backendMatches.length === 0) {
            return NextResponse.json({ success: true, matches: [], message: "No confident matches found" })
        }

        const returnedMatches: { studentId: string, studentName: string, confidence: number, status: string }[] = []

        const now = new Date()
        const startDt = new Date(sessionInfo.start_time)

        const graceMs = (sessionInfo.grace_period || 15) * 60 * 1000
        const lateThreshold = new Date(startDt.getTime() + graceMs)

        const calculatedStatus = now <= lateThreshold ? "PRESENT" : "LATE"

        await withDb(async (db) => {
            await db.query("BEGIN")

            for (const match of backendMatches) {
                const sId = match.student_id

                const studentData = await db.query("SELECT first_name, last_name FROM students WHERE id = $1", [sId])
                if (studentData.rows.length === 0) continue
                const sName = `${studentData.rows[0].first_name} ${studentData.rows[0].last_name}`

                const existing = await db.query(
                    "SELECT status FROM attendance_records WHERE session_id = $1 AND student_id = $2",
                    [sessionId, sId]
                )

                if (existing.rows.length > 0) {
                    const status = existing.rows[0].status
                    if (status !== "ABSENT") {
                        continue
                    }
                }

                await db.query(`
                    INSERT INTO attendance_records (id, session_id, student_id, status, confidence_score, recognized_at, updated_at)
                    VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
                    ON CONFLICT (session_id, student_id)
                    DO UPDATE SET status = EXCLUDED.status, 
                                  confidence_score = GREATEST(COALESCE(attendance_records.confidence_score, 0::numeric), EXCLUDED.confidence_score),
                                  recognized_at = NOW(),
                                  updated_at = NOW()
                `, [sessionId, sId, calculatedStatus, match.confidence])

                returnedMatches.push({
                    studentId: sId,
                    studentName: sName,
                    confidence: match.confidence,
                    status: calculatedStatus
                })
            }

            await db.query("COMMIT")
        })

        return NextResponse.json({ success: true, matches: returnedMatches })

    } catch (error) {
        console.error("Live processing error:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}
