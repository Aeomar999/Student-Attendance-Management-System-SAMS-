"use client"

import { BarChart3, AlertTriangle, CheckCircle2, Users, BookOpen, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    const color = rate >= 75 ? "bg-primary" : rate >= 50 ? "bg-yellow-500" : "bg-destructive"
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
            </div>
            <span className={`text-sm font-medium w-12 text-right ${rate >= 75 ? "text-primary" : rate >= 50 ? "text-yellow-500" : "text-destructive"}`}>
                {rate}%
            </span>
        </div>
    )
}

export function ReportsClient({ stats, courseStats, atRiskStudents }: Props) {
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
{ label: "Overall Rate", value: `${stats.overallAttendanceRate}%`, color: stats.overallAttendanceRate >= 75 ? "text-primary" : "text-yellow-600" },
                    { label: "Face Enrolled", value: stats.faceEnrolledCount, color: "text-blue-600" },
                    { label: "At-Risk Students", value: stats.studentsAtRisk, color: stats.studentsAtRisk > 0 ? "text-destructive" : "text-primary" },
                ].map((item, i) => (
                    <Card key={item.label} className={`rounded-xl border flex flex-col justify-center ${i === 0 ? "bg-primary text-primary-foreground" : "border-border/50 bg-card/80 backdrop-blur-sm"} p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
                        <div className={`text-[10px] md:text-xs font-medium uppercase tracking-wider ${i === 0 ? "text-white/80" : "text-muted-foreground"}`}>{item.label}</div>
                        <div className={`mt-1 text-xl md:text-2xl font-bold ${"color" in item ? item.color : ""}`}>{item.value}</div>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                    <TabsTrigger value="courses" className="rounded-lg">By Course</TabsTrigger>
                    <TabsTrigger value="atrisk" className="rounded-lg">
                        At-Risk Students
                        {stats.studentsAtRisk > 0 && (
                            <Badge variant="destructive" className="ml-2 h-4 text-xs">{stats.studentsAtRisk}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Tab Content */}
                <TabsContent value="overview">
                    <div className="grid md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-base font-semibold">Attendance Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Overall Attendance Rate</span>
                                    <span className="font-medium">{stats.overallAttendanceRate}%</span>
                                </div>
                                <RateBar rate={stats.overallAttendanceRate} />
                                <div className="pt-4 space-y-3 text-sm border-t border-border/50">
                                    <div className="flex items-center gap-2 text-primary bg-primary/5 dark:bg-primary/10 p-2.5 rounded-lg border border-primary/20 dark:border-primary/30">
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        <span>{stats.faceEnrolledCount} students with face data enrolled</span>
                                    </div>
                                    {stats.studentsAtRisk > 0 && (
                                        <div className="flex items-center gap-2 text-destructive bg-destructive/5 dark:bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 dark:border-destructive/30">
                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                            <span>{stats.studentsAtRisk} students below 75% attendance threshold</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-base font-semibold">Quick Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="space-y-3 text-sm">
                                {[
                                    ["Total Students", stats.totalStudents],
                                    ["Total Sessions Run", stats.totalSessions],
                                    ["Total Attendance Records", stats.totalRecords],
                                    ["Face-Enrolled Students", stats.faceEnrolledCount],
                                    ["Students At Risk (<75%)", stats.studentsAtRisk],
                                ].map(([label, val]) => (
                                    <div key={label as string} className="flex justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/30 px-2 rounded-md transition-colors">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="font-medium">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </TabsContent>

                <TabsContent value="courses">
                    <Card className="overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold">Code</TableHead>
                                <TableHead className="font-semibold">Course Name</TableHead>
                                <TableHead className="font-semibold text-center">Sessions</TableHead>
                                <TableHead className="font-semibold text-center">Records</TableHead>
                                <TableHead className="font-semibold text-center">Present</TableHead>
                                <TableHead className="font-semibold min-w-[160px]">Attendance Rate</TableHead>
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
                                <TableRow key={c.courseId} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono font-medium text-sm text-foreground/80">{c.courseCode}</TableCell>
                                    <TableCell className="font-medium">{c.courseName}</TableCell>
                                    <TableCell className="text-center">{c.totalSessions}</TableCell>
                                    <TableCell className="text-center">{c.totalRecords}</TableCell>
                                    <TableCell className="text-center font-medium text-primary">{c.totalPresent}</TableCell>
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
                </Card>
                </TabsContent>

                <TabsContent value="atrisk">
                    <Card className="overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold">Student</TableHead>
                                <TableHead className="font-semibold">Student ID</TableHead>
                                <TableHead className="font-semibold text-center">Sessions</TableHead>
                                <TableHead className="font-semibold text-center">Present</TableHead>
                                <TableHead className="font-semibold min-w-[160px]">Attendance Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {atRiskStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-primary">
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle2 className="h-8 w-8" />
                                            <span className="font-medium">No at-risk students — excellent attendance!</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : atRiskStudents.map(s => (
                                <TableRow key={s.studentId} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{s.studentName}</span>
                                            <span className="text-xs text-muted-foreground">{s.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-foreground/80">{s.studentRefId}</TableCell>
                                    <TableCell className="text-center">{s.totalSessions}</TableCell>
                                    <TableCell className="text-center font-medium text-primary">{s.presentCount}</TableCell>
                                    <TableCell><RateBar rate={s.attendanceRate} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
