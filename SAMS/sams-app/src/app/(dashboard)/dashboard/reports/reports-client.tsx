"use client"

import { useState } from "react"
import { BarChart3, AlertTriangle, CheckCircle2, Users, BookOpen, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { OverallStats, CourseAttendanceStats, AtRiskStudent } from "@/app/actions/reports"

type Props = {
    stats: OverallStats
    courseStats: CourseAttendanceStats[]
    atRiskStudents: AtRiskStudent[]
}

function RateBar({ rate }: { rate: number }) {
    const color = rate >= 75 ? "bg-green-500" : rate >= 50 ? "bg-amber-500" : "bg-red-500"
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
            </div>
            <span className={`text-sm font-medium w-12 text-right ${rate >= 75 ? "text-green-600" : rate >= 50 ? "text-amber-500" : "text-red-500"}`}>
                {rate}%
            </span>
        </div>
    )
}

export function ReportsClient({ stats, courseStats, atRiskStudents }: Props) {
    const [activeTab, setActiveTab] = useState<"overview" | "courses" | "atrisk">("overview")

    const exportCSV = () => {
        const rows = courseStats.map(c =>
            [c.courseCode, c.courseName, c.totalSessions, c.totalRecords, c.totalPresent, `${c.attendanceRate}%`].join(",")
        )
        const csv = ["Course Code,Course Name,Sessions,Total Records,Present,Attendance Rate", ...rows].join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url; a.download = "sams-attendance-report.csv"; a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-sm text-muted-foreground">Institutional attendance insights</p>
                    </div>
                </div>
                <Button variant="outline" onClick={exportCSV}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "" },
                    { label: "Active Courses", value: stats.totalSessions, icon: BookOpen, color: "" },
                    { label: "Total Sessions", value: stats.totalSessions, icon: BarChart3, color: "" },
                    { label: "Overall Rate", value: `${stats.overallAttendanceRate}%`, color: stats.overallAttendanceRate >= 75 ? "text-green-500" : "text-amber-500" },
                    { label: "Face Enrolled", value: stats.faceEnrolledCount, color: "text-blue-500" },
                    { label: "At-Risk Students", value: stats.studentsAtRisk, color: stats.studentsAtRisk > 0 ? "text-red-500" : "text-green-500" },
                ].map(item => (
                    <div key={item.label} className="rounded-lg border bg-card p-4">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</div>
                        <div className={`mt-1 text-2xl font-bold ${"color" in item ? item.color : ""}`}>{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {(["overview", "courses", "atrisk"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        {tab === "overview" ? "Overview" : tab === "courses" ? "By Course" : "At-Risk Students"}
                        {tab === "atrisk" && stats.studentsAtRisk > 0 && (
                            <Badge variant="destructive" className="ml-2 h-4 text-xs">{stats.studentsAtRisk}</Badge>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="rounded-lg border bg-card p-6 space-y-4">
                        <h3 className="font-semibold">Attendance Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Overall Attendance Rate</span>
                                <span>{stats.overallAttendanceRate}%</span>
                            </div>
                            <RateBar rate={stats.overallAttendanceRate} />
                            <div className="pt-3 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{stats.faceEnrolledCount} students with face data enrolled</span>
                                </div>
                                {stats.studentsAtRisk > 0 && (
                                    <div className="flex items-center gap-2 text-red-500">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>{stats.studentsAtRisk} students below 75% attendance threshold</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-6 space-y-4">
                        <h3 className="font-semibold">Quick Statistics</h3>
                        <div className="space-y-3 text-sm">
                            {[
                                ["Total Students", stats.totalStudents],
                                ["Total Sessions Run", stats.totalSessions],
                                ["Total Attendance Records", stats.totalRecords],
                                ["Face-Enrolled Students", stats.faceEnrolledCount],
                                ["Students At Risk (<75%)", stats.studentsAtRisk],
                            ].map(([label, val]) => (
                                <div key={label as string} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className="font-medium">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "courses" && (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Course Name</TableHead>
                                <TableHead className="text-center">Sessions</TableHead>
                                <TableHead className="text-center">Records</TableHead>
                                <TableHead className="text-center">Present</TableHead>
                                <TableHead className="min-w-[160px]">Attendance Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courseStats.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        No course data available yet.
                                    </TableCell>
                                </TableRow>
                            ) : courseStats.map(c => (
                                <TableRow key={c.courseId}>
                                    <TableCell className="font-mono font-medium text-sm">{c.courseCode}</TableCell>
                                    <TableCell>{c.courseName}</TableCell>
                                    <TableCell className="text-center">{c.totalSessions}</TableCell>
                                    <TableCell className="text-center">{c.totalRecords}</TableCell>
                                    <TableCell className="text-center text-green-600">{c.totalPresent}</TableCell>
                                    <TableCell className="min-w-[160px]">
                                        {c.totalRecords === 0 ? (
                                            <span className="text-muted-foreground text-sm">No data</span>
                                        ) : (
                                            <RateBar rate={c.attendanceRate} />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {activeTab === "atrisk" && (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Student ID</TableHead>
                                <TableHead className="text-center">Sessions</TableHead>
                                <TableHead className="text-center">Present</TableHead>
                                <TableHead className="min-w-[160px]">Attendance Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {atRiskStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-green-600">
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle2 className="h-8 w-8" />
                                            <span className="font-medium">No at-risk students — excellent attendance!</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : atRiskStudents.map(s => (
                                <TableRow key={s.studentId}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{s.studentName}</span>
                                            <span className="text-xs text-muted-foreground">{s.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{s.studentRefId}</TableCell>
                                    <TableCell className="text-center">{s.totalSessions}</TableCell>
                                    <TableCell className="text-center">{s.presentCount}</TableCell>
                                    <TableCell><RateBar rate={s.attendanceRate} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
