"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertCircle, Download, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { markAttendance } from "@/app/actions/attendance"

interface SessionDetail {
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

interface SessionRecord {
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

interface Props {
    session: SessionDetail
    records: SessionRecord[]
}

export function SessionDetailClient({ session, records: initialRecords }: Props) {
    const [records, setRecords] = useState(initialRecords)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const statusCounts = {
        PRESENT: records.filter(r => r.status === "PRESENT").length,
        ABSENT: records.filter(r => r.status === "ABSENT").length,
        LATE: records.filter(r => r.status === "LATE").length,
        EXCUSED: records.filter(r => r.status === "EXCUSED").length,
    }

    const statusIcon = (status: string) => {
        switch (status) {
            case "PRESENT": return <CheckCircle2 className="h-4 w-4 text-green-600" />
            case "ABSENT": return <XCircle className="h-4 w-4 text-red-500" />
            case "LATE": return <Clock className="h-4 w-4 text-amber-500" />
            case "EXCUSED": return <AlertCircle className="h-4 w-4 text-blue-500" />
            default: return null
        }
    }

    const statusColor = (status: string) => {
        switch (status) {
            case "PRESENT": return "bg-green-100 text-green-800 border-green-200"
            case "ABSENT": return "bg-red-100 text-red-800 border-red-200"
            case "LATE": return "bg-amber-100 text-amber-800 border-amber-200"
            case "EXCUSED": return "bg-blue-100 text-blue-800 border-blue-200"
            default: return ""
        }
    }

    async function handleStatusChange(studentId: string, newStatus: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") {
        setUpdatingId(studentId)
        try {
            const result = await markAttendance(session.id, studentId, newStatus, "Manual override from session detail")
            if (result.success) {
                setRecords(prev => prev.map(r =>
                    r.studentId === studentId ? { ...r, status: newStatus, isManual: true } : r
                ))
                toast.success(`Marked as ${newStatus.toLowerCase()}`)
            } else {
                toast.error(result.error || "Failed to update status")
            }
        } catch {
            toast.error("Failed to update attendance")
        } finally {
            setUpdatingId(null)
        }
    }

    function exportSessionCSV() {
        const headers = ["Student ID", "Name", "Email", "Status", "Recognized At", "Confidence", "Manual"]
        const rows = records.map(r => [
            r.studentRefId,
            r.studentName,
            r.email,
            r.status,
            r.recognizedAt || "",
            r.confidenceScore?.toFixed(2) || "",
            r.isManual ? "Yes" : "No",
        ].join(","))
        const csv = [headers.join(","), ...rows].join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `session-${session.courseCode}-${format(new Date(session.sessionDate), "yyyy-MM-dd")}.csv`
        anchor.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            {/* Back link + Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/attendance">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {session.courseCode} — {session.courseName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(session.sessionDate), "EEEE, MMMM d, yyyy")}
                        {" · "}
                        {session.startTime ? format(new Date(session.startTime), "HH:mm") : ""}
                        {session.endTime ? ` – ${format(new Date(session.endTime), "HH:mm")}` : ""}
                        {session.lecturerName && ` · ${session.lecturerName}`}
                    </p>
                </div>
                <Badge variant={session.status === "ACTIVE" ? "default" : session.status === "COMPLETED" ? "secondary" : "outline"}>
                    {session.status}
                </Badge>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Present", count: statusCounts.PRESENT, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
                    { label: "Absent", count: statusCounts.ABSENT, icon: XCircle, color: "text-red-500 bg-red-50" },
                    { label: "Late", count: statusCounts.LATE, icon: Clock, color: "text-amber-500 bg-amber-50" },
                    { label: "Excused", count: statusCounts.EXCUSED, icon: AlertCircle, color: "text-blue-500 bg-blue-50" },
                ].map(item => (
                    <div key={item.label} className="rounded-lg border bg-card p-4 flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{item.count}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCheck className="h-4 w-4" />
                    <span>{records.length} students · Grace period: {session.gracePeriod} min</span>
                </div>
                <Button variant="outline" onClick={exportSessionCSV}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* Records Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No attendance records for this session.
                                </TableCell>
                            </TableRow>
                        ) : records.map(record => (
                            <TableRow key={record.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{record.studentName}</span>
                                        <span className="text-xs text-muted-foreground">{record.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{record.studentRefId}</TableCell>
                                <TableCell>
                                    <Badge variant="outline"
                                        className={`${statusColor(record.status)} flex items-center gap-1 w-fit`}>
                                        {statusIcon(record.status)}
                                        {record.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {record.confidenceScore
                                        ? `${(record.confidenceScore * 100).toFixed(0)}%`
                                        : <span className="text-muted-foreground">—</span>}
                                </TableCell>
                                <TableCell>
                                    <span className={`text-xs ${record.isManual ? "text-amber-600" : "text-green-600"}`}>
                                        {record.isManual ? "Manual" : "FR"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Select
                                        value={record.status}
                                        onValueChange={(val) => handleStatusChange(
                                            record.studentId,
                                            val as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
                                        )}
                                        disabled={updatingId === record.studentId}
                                    >
                                        <SelectTrigger className="w-[110px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PRESENT">Present</SelectItem>
                                            <SelectItem value="ABSENT">Absent</SelectItem>
                                            <SelectItem value="LATE">Late</SelectItem>
                                            <SelectItem value="EXCUSED">Excused</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
