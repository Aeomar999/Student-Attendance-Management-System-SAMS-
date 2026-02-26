"use client";

import { format } from "date-fns";
import Link from "next/link";
import {
    ArrowLeft, User, BookOpen, CheckCircle2, Clock, XCircle, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

type AttendanceRecord = {
    id: string;
    status: string;
    recognizedAt: string | null;
    isManual: boolean;
    manualReason: string | null;
    confidenceScore: number | null;
    sessionId: string;
    sessionDate: string;
    startTime: string;
    courseCode: string;
    courseName: string;
};

type Summary = {
    totalSessions: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    attendanceRate: number;
};

type Student = {
    id: string;
    studentRefId: string;
    firstName: string;
    lastName: string;
    email: string;
    faceEnrolled: boolean;
    status: string;
    consentGiven: boolean;
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; class: string }> = {
    PRESENT: { label: "Present", icon: CheckCircle2, class: "text-green-600" },
    LATE: { label: "Late", icon: Clock, class: "text-yellow-600" },
    ABSENT: { label: "Absent", icon: XCircle, class: "text-red-600" },
    EXCUSED: { label: "Excused", icon: AlertCircle, class: "text-blue-600" },
};

export function StudentDetailClient({
    data,
}: {
    data: { student: Student; summary: Summary; records: AttendanceRecord[] };
}) {
    const { student, summary, records } = data;

    return (
        <div className="space-y-6">
            {/* Back link */}
            <Link href="/dashboard/students">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Students
                </Button>
            </Link>

            {/* Profile card */}
            <div className="rounded-xl border bg-card p-6 flex flex-col sm:flex-row gap-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                    <h1 className="text-2xl font-bold">
                        {student.firstName} {student.lastName}
                    </h1>
                    <p className="text-muted-foreground">{student.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">{student.studentRefId}</Badge>
                        <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                            {student.status}
                        </Badge>
                        {student.faceEnrolled ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                ✓ Face Enrolled
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                                Face Not Enrolled
                            </Badge>
                        )}
                        {student.consentGiven && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Consent Given
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: "Total Sessions", value: summary.totalSessions, color: "text-foreground" },
                    { label: "Present", value: summary.present, color: "text-green-600" },
                    { label: "Late", value: summary.late, color: "text-yellow-600" },
                    { label: "Absent", value: summary.absent, color: "text-red-600" },
                    { label: "Excused", value: summary.excused, color: "text-blue-600" },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border bg-card p-4 text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Attendance rate bar */}
            <div className="rounded-lg border bg-card p-5 space-y-2">
                <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Overall Attendance Rate</span>
                    </div>
                    <span className="text-xl font-bold">{summary.attendanceRate}%</span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${summary.attendanceRate}%` }}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    {summary.present + summary.late} attended of {summary.totalSessions} sessions
                    {summary.attendanceRate < 75 && (
                        <span className="ml-2 text-red-500 font-medium">⚠ Below 75% threshold</span>
                    )}
                </p>
            </div>

            {/* Records table */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b">
                    <h2 className="font-semibold">Attendance History ({records.length} records)</h2>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    No attendance records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record) => {
                                const cfg = STATUS_CONFIG[record.status] || { label: record.status, icon: Clock, class: "text-gray-500" };
                                const Icon = cfg.icon;
                                return (
                                    <TableRow key={record.id}>
                                        <TableCell className="text-sm">
                                            {format(new Date(record.sessionDate), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-sm">{record.courseCode}</p>
                                            <p className="text-xs text-muted-foreground">{record.courseName}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`flex items-center gap-1 ${cfg.class}`}>
                                                <Icon className="h-4 w-4" />
                                                <span className="text-sm font-medium">{cfg.label}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={record.isManual ? "outline" : "secondary"} className="text-xs">
                                                {record.isManual ? "Manual" : "System"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                            {record.manualReason || "—"}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
