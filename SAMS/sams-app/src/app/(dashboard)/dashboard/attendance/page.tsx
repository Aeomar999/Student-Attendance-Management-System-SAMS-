import { Metadata } from "next"
import { getAttendanceSessions, getAttendanceStats, getCoursesForDropdown } from "@/app/actions/attendance"
import { AttendanceClient } from "./attendance-client"

export const metadata: Metadata = {
    title: "Attendance | SAMS",
    description: "Manage attendance sessions and records",
}

export default async function AttendancePage() {
    const [sessionsResult, statsResult, coursesResult] = await Promise.all([
        getAttendanceSessions(),
        getAttendanceStats(),
        getCoursesForDropdown(),
    ])

    const defaultStats = { totalSessions: 0, attendanceRate: 0, totalPresent: 0, activeCourses: 0 }

    return (
        <div className="flex-1 space-y-4">
            <AttendanceClient
                initialSessions={sessionsResult.success ? (sessionsResult.data ?? []) : []}
                initialStats={statsResult.success ? (statsResult.data ?? defaultStats) : defaultStats}
                courses={coursesResult.success ? (coursesResult.data ?? []) : []}
            />
        </div>
    )
}
