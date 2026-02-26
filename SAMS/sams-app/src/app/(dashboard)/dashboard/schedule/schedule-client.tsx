"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ScheduleSession } from "@/app/actions/schedule"

type Props = { initialSessions: ScheduleSession[]; currentWeekStart: string }

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function ScheduleClient({ initialSessions, currentWeekStart }: Props) {
    const [weekStart, setWeekStart] = useState(new Date(currentWeekStart))
    const [sessions] = useState<ScheduleSession[]>(initialSessions)

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    const sessionsForDay = (date: Date) =>
        sessions.filter(s => {
            const d = new Date(s.sessionDate)
            return isSameDay(d, date)
        })

    const statusColor = (status: string) =>
        status === "ACTIVE" ? "bg-green-500/15 border-green-500 text-green-700"
            : status === "COMPLETED" ? "bg-blue-500/10 border-blue-400 text-blue-700"
                : "bg-muted border-border text-muted-foreground"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
                        <p className="text-sm text-muted-foreground">
                            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                        This Week
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Weekly Grid */}
            <div className="rounded-md border bg-card overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b">
                    {weekDays.map((day, i) => {
                        const isToday = isSameDay(day, new Date())
                        return (
                            <div key={i} className={`p-3 text-center border-r last:border-r-0 ${isToday ? "bg-primary/5" : ""}`}>
                                <div className={`text-xs font-medium uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                                    {SHORT_DAYS[i]}
                                </div>
                                <div className={`text-lg font-bold mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mx-auto
                                    ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                                    {format(day, "d")}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Sessions grid */}
                <div className="grid grid-cols-7 min-h-[400px] divide-x">
                    {weekDays.map((day, i) => {
                        const daySessions = sessionsForDay(day)
                        const isToday = isSameDay(day, new Date())
                        return (
                            <div key={i} className={`p-2 space-y-1 ${isToday ? "bg-primary/5" : ""}`}>
                                {daySessions.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground/40 text-center py-8">
                                        —
                                    </div>
                                ) : daySessions.map(session => (
                                    <div key={session.id}
                                        className={`rounded border px-2 py-1.5 text-xs ${statusColor(session.status)}`}>
                                        <div className="font-bold truncate">{session.courseCode}</div>
                                        <div className="truncate text-xs opacity-75">{session.courseName}</div>
                                        <div className="mt-1 opacity-60">
                                            {session.startTime ? format(new Date(session.startTime), "HH:mm") : "—"}
                                        </div>
                                        {session.status === "COMPLETED" && (
                                            <div className="mt-1">
                                                <span className="text-green-600">✓{session.totalPresent}</span>
                                                <span className="text-red-500 ml-1">✗{session.totalAbsent}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border-2 border-green-500 bg-green-500/15" />
                    <span>Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border-2 border-blue-400 bg-blue-500/10" />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border-2 border-border bg-muted" />
                    <span>Scheduled</span>
                </div>
            </div>
        </div>
    )
}
