import { Metadata } from "next"
import { getOverallStats, getCourseAttendanceStats, getAtRiskStudents } from "@/app/actions/reports"
import { ReportsClient } from "./reports-client"

export const metadata: Metadata = {
    title: "Reports | SAMS",
    description: "Attendance analytics and reports",
}

export default async function ReportsPage() {
    const [statsRes, courseRes, atRiskRes] = await Promise.all([
        getOverallStats(),
        getCourseAttendanceStats(),
        getAtRiskStudents(),
    ])

    const defaultStats = {
        totalStudents: 0, totalSessions: 0, totalRecords: 0,
        overallAttendanceRate: 0, faceEnrolledCount: 0, studentsAtRisk: 0,
    }

    return (
        <div className="flex-1 space-y-4">
            <ReportsClient
                stats={statsRes.success ? (statsRes.data ?? defaultStats) : defaultStats}
                courseStats={courseRes.success ? (courseRes.data ?? []) : []}
                atRiskStudents={atRiskRes.success ? (atRiskRes.data ?? []) : []}
            />
        </div>
    )
}
