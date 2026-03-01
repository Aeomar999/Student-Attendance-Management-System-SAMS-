"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay, startOfMonth, subDays, addMonths, subMonths, isSameMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ScheduleSession } from "@/app/actions/schedule"

type Props = { initialSessions: ScheduleSession[]; currentWeekStart: string }

type ViewType = "day" | "week" | "month"

const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function ScheduleClient({ initialSessions, currentWeekStart }: Props) {
    const [view, setView] = useState<ViewType>("week")
    const [currentDate, setCurrentDate] = useState(new Date(currentWeekStart))
    const [sessions] = useState<ScheduleSession[]>(initialSessions)

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    const monthStart = startOfMonth(currentDate)
    const monthStartDay = monthStart.getDay()
    const startOffset = monthStartDay === 0 ? 6 : monthStartDay - 1
    const calendarStart = subDays(monthStart, startOffset)
    const calendarDays = Array.from({ length: 42 }, (_, i) => addDays(calendarStart, i))

    const sessionsForDay = (date: Date) =>
        sessions.filter(s => {
            const d = new Date(s.sessionDate)
            return isSameDay(d, date)
        }).sort((a, b) => {
            if (!a.startTime || !b.startTime) return 0
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        })

    const statusColor = (status: string) =>
        status === "ACTIVE" ? "bg-primary/10 border-primary text-primary"
            : status === "COMPLETED" ? "bg-blue-500/10 border-blue-400 text-blue-700"
                : "bg-muted border-border text-muted-foreground"

    const handlePrevious = () => {
        if (view === "day") setCurrentDate(subDays(currentDate, 1))
        else if (view === "week") setCurrentDate(subWeeks(currentDate, 1))
        else setCurrentDate(subMonths(currentDate, 1))
    }

    const handleNext = () => {
        if (view === "day") setCurrentDate(addDays(currentDate, 1))
        else if (view === "week") setCurrentDate(addWeeks(currentDate, 1))
        else setCurrentDate(addMonths(currentDate, 1))
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }

    const displayDateRange = () => {
        if (view === "day") return format(currentDate, "MMMM d, yyyy")
        if (view === "week") return `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}`
        return format(currentDate, "MMMM yyyy")
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
                        <p className="text-sm text-muted-foreground">
                            {displayDateRange()}
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <Tabs value={view} onValueChange={(v) => setView(v as ViewType)} className="w-full sm:w-auto">
                        <TabsList className="grid w-full sm:w-[240px] grid-cols-3">
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="week">Week</TabsTrigger>
                            <TabsTrigger value="month">Month</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button variant="outline" size="icon" onClick={handlePrevious}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleToday}>
                            Today
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleNext}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Views Layout */}
            {view === "day" && (
                <div className="space-y-4">
                    {sessionsForDay(currentDate).length === 0 ? (
                        <Card className="flex flex-col items-center justify-center py-20 text-muted-foreground shadow-sm">
                            <Calendar className="h-12 w-12 opacity-20 mb-4" />
                            <p>No sessions scheduled for this day</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {sessionsForDay(currentDate).map(session => (
                                <Card key={session.id} className={`flex flex-col sm:flex-row overflow-hidden border-l-4 shadow-sm ${statusColor(session.status)} bg-card! text-card-foreground!`}>
                                    <div className="p-4 sm:w-32 bg-muted/20 flex flex-col justify-center items-center sm:items-start border-b sm:border-b-0 sm:border-r">
                                        <div className="text-xl font-bold">
                                            {session.startTime ? format(new Date(session.startTime), "HH:mm") : "—"}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{session.status}</div>
                                    </div>
                                    <div className="p-4 flex-1">
                                        <div className="font-bold text-lg mb-1">{session.courseCode} — {session.courseName}</div>
                                        {session.status === "COMPLETED" && (
                                            <div className="mt-3 flex gap-4 font-medium text-sm bg-muted/30 p-2 rounded-md">
                                                <span className="text-primary flex items-center">✓ Present: {session.totalPresent}</span>
                                                <span className="text-destructive flex items-center">✗ Absent: {session.totalAbsent}</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {view === "week" && (
                <Card className="rounded-md border shadow-sm bg-card overflow-hidden overflow-x-auto">
                    <div className="min-w-[800px]">
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
                                            <div className="truncate text-[10px] opacity-75">{session.courseName}</div>
                                            <div className="mt-1 opacity-60 font-medium">
                                                {session.startTime ? format(new Date(session.startTime), "HH:mm") : "—"}
                                            </div>
                                            {session.status === "COMPLETED" && (
                                                <div className="mt-1 pt-1 border-t border-black/10 dark:border-white/10 flex justify-between">
                                                    <span className="text-primary font-medium">✓{session.totalPresent}</span>
                                                    <span className="text-destructive font-medium">✗{session.totalAbsent}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                    </div>
                </Card>
            )}

            {view === "month" && (
                <Card className="rounded-md border shadow-sm bg-card overflow-hidden overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-7 border-b bg-muted/30">
                        {SHORT_DAYS.map((day, i) => (
                            <div key={i} className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)] divide-x divide-y">
                        {calendarDays.map((day, i) => {
                            const daySessions = sessionsForDay(day)
                            const isCurrentMonth = isSameMonth(day, currentDate)
                            const isToday = isSameDay(day, new Date())
                            
                            return (
                                <div key={i} className={`p-1.5 sm:p-2 transition-colors hover:bg-muted/50 ${!isCurrentMonth ? "bg-muted/10 opacity-50" : ""} ${isToday ? "bg-primary/5" : ""}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                                            {format(day, "d")}
                                        </span>
                                        {daySessions.length > 0 && <span className="text-[10px] text-muted-foreground bg-muted border px-1.5 py-0.5 rounded-full">{daySessions.length}</span>}
                                    </div>
                                    <div className="space-y-1 mt-1">
                                        {daySessions.slice(0, 3).map(session => (
                                            <div key={session.id} className={`truncate text-[10px] px-1.5 py-0.5 rounded border ${statusColor(session.status)}`}>
                                                <span className="font-medium mr-1">{session.startTime ? format(new Date(session.startTime), "HH:mm") : ""}</span>
                                                {session.courseCode}
                                            </div>
                                        ))}
                                        {daySessions.length > 3 && (
                                            <div className="text-[10px] text-muted-foreground text-center font-medium mt-1">
                                                +{daySessions.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    </div>
                </Card>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border-2 border-primary bg-primary/10" />
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
