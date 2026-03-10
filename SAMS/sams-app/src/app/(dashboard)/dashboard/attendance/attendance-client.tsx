"use client"

import { useState, Fragment } from "react"
import Link from "next/link"
import { CalendarCheck, Plus, CheckCircle2, XCircle, Clock, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Video } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
} from "@/components/ui/sheet"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    createAttendanceSession,
    closeAttendanceSession,
    getSessionRecords,
    markAttendance,
    type AttendanceSessionRow,
    type AttendanceRecordRow,
} from "@/app/actions/attendance"

type CourseDropdown = { id: string; code: string; name: string }

type StatsData = {
    totalSessions: number
    attendanceRate: number
    totalPresent: number
    activeCourses: number
}

type Props = {
    initialSessions: AttendanceSessionRow[]
    initialStats: StatsData
    courses: CourseDropdown[]
}

export function AttendanceClient({ initialSessions, initialStats, courses }: Props) {
    const [sessions] = useState<AttendanceSessionRow[]>(initialSessions)
    const [stats] = useState<StatsData>(initialStats)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
    const [sessionRecords, setSessionRecords] = useState<Record<string, AttendanceRecordRow[]>>({})
    const [loadingRecords, setLoadingRecords] = useState<string | null>(null)

    // New session form
    const [courseId, setCourseId] = useState("")
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0] ?? "")
    const [startTime, setStartTime] = useState(
        new Date().toTimeString().slice(0, 5)
    )
    const [gracePeriod, setGracePeriod] = useState(15)

    // Excused reason state per student
    const [excuseReason, setExcuseReason] = useState<Record<string, string>>({})

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const result = await createAttendanceSession({ courseId, sessionDate, startTime, gracePeriod })
            if (result.success) {
                toast.success("Attendance session started")
                setIsSheetOpen(false)
                window.location.reload()
            } else {
                toast.error(result.error ?? "Failed to start session")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCloseSession = async (sessionId: string) => {
        if (!confirm("Close this session? No more records can be added after closing.")) return
        setIsLoading(true)
        try {
            const result = await closeAttendanceSession(sessionId)
            if (result.success) {
                toast.success("Session closed")
                window.location.reload()
            } else {
                toast.error(result.error ?? "Failed to close session")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleExpand = async (sessionId: string) => {
        if (expandedSessionId === sessionId) {
            setExpandedSessionId(null)
            return
        }
        setExpandedSessionId(sessionId)
        if (sessionRecords[sessionId]) return
        setLoadingRecords(sessionId)
        try {
            const result = await getSessionRecords(sessionId)
            if (result.success) {
                setSessionRecords(prev => ({ ...prev, [sessionId]: result.data ?? [] }))
            } else {
                toast.error("Failed to load records")
            }
        } finally {
            setLoadingRecords(null)
        }
    }

    const handleMark = async (
        sessionId: string,
        studentId: string,
        status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
        reason?: string
    ) => {
        const result = await markAttendance(sessionId, studentId, status, reason)
        if (result.success) {
            setSessionRecords(prev => ({
                ...prev,
                [sessionId]: (prev[sessionId] ?? []).map(r =>
                    r.studentId === studentId ? { ...r, status, isManual: true, manualReason: reason ?? null } : r
                ),
            }))
            toast.success(`Marked ${status.toLowerCase()}`)
        } else {
            toast.error(result.error ?? "Failed to mark attendance")
        }
    }

    const statusBadge = (status: string) => {
        if (status === "ACTIVE") return <Badge className="bg-primary">Active</Badge>
        if (status === "COMPLETED") return <Badge variant="secondary">Completed</Badge>
        return <Badge variant="outline">{status}</Badge>
    }

const recordStatusIcon = (status: string) => {
        if (status === "PRESENT") return <CheckCircle2 className="h-4 w-4 text-primary" />
        if (status === "LATE") return <Clock className="h-4 w-4 text-yellow-500" />
        if (status === "EXCUSED") return <AlertCircle className="h-4 w-4 text-blue-500" />
        return <XCircle className="h-4 w-4 text-destructive" />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
                        <p className="text-sm text-muted-foreground">Manage attendance sessions and records</p>
                    </div>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button >
                            <Plus className="mr-2 h-4 w-4" /> Start Session
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Start Attendance Session</SheetTitle>
                            <SheetDescription>Create a new attendance session for a course.</SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleCreateSession} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Course *</Label>
                                <Select value={courseId} onValueChange={setCourseId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.length === 0 ? (
                                            <SelectItem value="__none__" disabled>No active courses found</SelectItem>
                                        ) : (
                                            courses.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.code} — {c.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sessionDate">Date *</Label>
                                    <Input id="sessionDate" type="date" value={sessionDate}
                                        onChange={e => setSessionDate(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startTime">Start Time *</Label>
                                    <Input id="startTime" type="time" value={startTime}
                                        onChange={e => setStartTime(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gracePeriod">Grace Period (minutes)</Label>
                                <Input
                                    id="gracePeriod"
                                    type="number"
                                    min={0}
                                    max={120}
                                    value={gracePeriod}
                                    onChange={e => setGracePeriod(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">Students arriving within this window are marked Late instead of Absent.</p>
                            </div>
                            <SheetFooter className="mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading || !courseId}>
                                    {isLoading ? "Starting..." : "Start Session"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="bg-primary/10 border-primary/30 shadow-sm transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-primary uppercase tracking-wider">
                            Total Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{stats.totalSessions}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Attendance Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent className={stats.attendanceRate >= 75 ? "text-primary" : "text-amber-600 dark:text-amber-400"}>
                        <div className="text-3xl font-bold">{stats.attendanceRate}%</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Present Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-primary">
                        <div className="text-3xl font-bold">{stats.totalPresent}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Active Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.activeCourses}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Sessions Table */}
            <Card className="overflow-hidden shadow-sm mt-6">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Course</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Time</TableHead>
                            <TableHead className="font-semibold text-center">Present</TableHead>
                            <TableHead className="font-semibold text-center">Absent</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <CalendarCheck className="h-8 w-8 opacity-30" />
                                        <span>No sessions yet. Start your first attendance session.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : sessions.map(session => (
                            <Fragment key={session.id}>
                                <TableRow
                                    key={session.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleToggleExpand(session.id)}
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium font-mono text-sm">{session.courseCode}</span>
                                            <span className="text-xs text-muted-foreground">{session.courseName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {session.sessionDate
                                            ? format(new Date(session.sessionDate), "MMM d, yyyy")
                                            : "—"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {session.startTime
                                            ? format(new Date(session.startTime), "HH:mm")
                                            : "—"}
                                        {session.endTime && (
                                            <> → {format(new Date(session.endTime), "HH:mm")}</>
                                        )}
                                    </TableCell>
<TableCell className="text-center font-medium text-primary">{session.totalPresent}</TableCell>
                                    <TableCell className="text-center font-medium text-destructive">{session.totalAbsent}</TableCell>
                                    <TableCell>{statusBadge(session.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2" onClick={e => e.stopPropagation()}>
                                            {session.status === "ACTIVE" && (
                                                <>
                                                    <Link href={`/dashboard/attendance/live/${session.id}`}>
                                                        <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                                                            <Video className="h-3 w-3" /> Live
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm" variant="outline"
                                                        onClick={() => handleCloseSession(session.id)}
                                                        disabled={isLoading}
                                                    >
                                                        Close Session
                                                    </Button>
                                                </>
                                            )}
                                            <Link href={`/dashboard/attendance/${session.id}`}>
                                                <Button size="sm" variant="ghost" className="gap-1">
                                                    <ExternalLink className="h-3 w-3" /> Detail
                                                </Button>
                                            </Link>
                                            {expandedSessionId === session.id
                                                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            }
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {/* Expandable records */}
                                {expandedSessionId === session.id && (
                                    <TableRow key={`${session.id}-records`}>
                                        <TableCell colSpan={7} className="p-0">
                                            <div className="bg-muted/30 border-t px-4 py-3">
                                                {loadingRecords === session.id ? (
                                                    <p className="text-sm text-muted-foreground py-4 text-center">Loading records...</p>
                                                ) : sessionRecords[session.id]?.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                                        No records yet. Mark students present/absent below or use facial recognition.
                                                    </p>
                                                ) : (
                                                    <Table className="w-full text-sm">
                                                        <TableHeader>
                                                            <TableRow className="text-xs text-muted-foreground uppercase border-b-border/50">
                                                                <TableHead className="text-left py-1 pr-4 h-auto bg-transparent">Student</TableHead>
                                                                <TableHead className="text-left py-1 pr-4 h-auto bg-transparent">Student ID</TableHead>
                                                                <TableHead className="text-left py-1 pr-4 h-auto bg-transparent">Status</TableHead>
                                                                <TableHead className="text-left py-1 h-auto bg-transparent">Source</TableHead>
                                                                {session.status === "ACTIVE" && (
                                                                    <TableHead className="text-right py-1 h-auto bg-transparent">Override</TableHead>
                                                                )}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {(sessionRecords[session.id] ?? []).map(rec => (
                                                                <TableRow key={rec.id} className="border-border/50 border-b-0 hover:bg-muted/50">
                                                                    <TableCell className="py-2 pr-4 font-medium">{rec.studentName}</TableCell>
                                                                    <TableCell className="py-2 pr-4 font-mono text-xs">{rec.studentRefId}</TableCell>
                                                                    <TableCell className="py-2 pr-4">
                                                                        <div className="flex items-center gap-1">
                                                                            {recordStatusIcon(rec.status)}
                                                                            <span>{rec.status}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="py-2 text-muted-foreground">
                                                                        {rec.isManual ? "Manual" : "FR Engine"}
                                                                    </TableCell>
                                                                    {session.status === "ACTIVE" && (
                                                                        <TableCell className="py-2 text-right">
                                                                            <div className="flex flex-col items-end gap-1">
                                                                                <div className="flex gap-1">
                                                                                    {(["PRESENT", "LATE", "ABSENT"] as const).map(s => (
                                                                                        <Button
                                                                                            key={s} size="sm"
                                                                                            variant={rec.status === s ? "default" : "outline"}
                                                                                            className="h-7 text-xs"
                                                                                            onClick={() => handleMark(session.id, rec.studentId, s)}
                                                                                        >
                                                                                            {s === "PRESENT" ? "✓" : s === "LATE" ? "⏰" : "✗"}
                                                                                        </Button>
                                                                                    ))}
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant={rec.status === "EXCUSED" ? "default" : "outline"}
                                                                                        className="h-7 text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
                                                                                        onClick={() => handleMark(
                                                                                            session.id, rec.studentId, "EXCUSED",
                                                                                            excuseReason[rec.studentId] || undefined
                                                                                        )}
                                                                                    >
                                                                                        Excused
                                                                                    </Button>
                                                                                </div>
                                                                                {rec.status === "EXCUSED" && (
                                                                                    <Input
                                                                                        className="h-6 text-xs w-40 mt-1"
                                                                                        placeholder="Reason (optional)"
                                                                                        value={excuseReason[rec.studentId] ?? ""}
                                                                                        onChange={e => setExcuseReason(prev => ({...prev, [rec.studentId]: e.target.value}))}
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                    )}
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
