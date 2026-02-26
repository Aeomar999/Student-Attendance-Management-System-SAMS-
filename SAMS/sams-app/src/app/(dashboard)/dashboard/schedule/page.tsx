import { Metadata } from "next"
import { getScheduleSessions } from "@/app/actions/schedule"
import { ScheduleClient } from "./schedule-client"

export const metadata: Metadata = {
    title: "Schedule | SAMS",
    description: "Weekly session schedule",
}

function getWeekRange() {
    const now = new Date()
    const day = now.getDay()
    // Start on Monday
    const diffToMonday = (day === 0 ? -6 : 1 - day)
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return {
        start: monday.toISOString().split("T")[0] as string,
        end: sunday.toISOString().split("T")[0] as string,
    }
}

export default async function SchedulePage() {
    const { start, end } = getWeekRange()
    const sessionsResult = await getScheduleSessions(start, end)

    return (
        <div className="flex-1 space-y-4">
            <ScheduleClient
                initialSessions={sessionsResult.success ? (sessionsResult.data ?? []) : []}
                currentWeekStart={start}
            />
        </div>
    )
}
