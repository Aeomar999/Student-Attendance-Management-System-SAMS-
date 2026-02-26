"use client";

import { useState, useTransition } from "react";
import {
    ArrowLeft, UserPlus, UserMinus, Search, CheckCircle2, XCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { enrollStudentsInCourse, unenrollStudentFromCourse } from "@/app/actions/course";

type EnrolledStudent = {
    id: string;
    studentRefId: string;
    firstName: string;
    lastName: string;
    email: string;
    faceEnrolled: boolean;
    status: string;
    enrolledAt: string;
    totalSessions: number;
    presentCount: number;
};

type AvailableStudent = {
    id: string;
    studentRefId: string;
    firstName: string;
    lastName: string;
    email: string;
    faceEnrolled: boolean;
};

export function EnrollmentClient({
    courseId,
    courseName,
    initialEnrolled,
    initialAvailable,
}: {
    courseId: string;
    courseName: string;
    initialEnrolled: EnrolledStudent[];
    initialAvailable: AvailableStudent[];
}) {
    const [enrolled, setEnrolled] = useState<EnrolledStudent[]>(initialEnrolled);
    const [available, setAvailable] = useState<AvailableStudent[]>(initialAvailable);
    const [enrollSearch, setEnrollSearch] = useState("");
    const [addSearch, setAddSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const filteredEnrolled = enrolled.filter(s =>
        `${s.firstName} ${s.lastName} ${s.studentRefId} ${s.email}`.toLowerCase().includes(enrollSearch.toLowerCase())
    );

    const filteredAvailable = available.filter(s =>
        `${s.firstName} ${s.lastName} ${s.studentRefId} ${s.email}`.toLowerCase().includes(addSearch.toLowerCase())
    );

    function toggleSelect(id: string) {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    function handleEnroll() {
        if (selectedIds.length === 0) return;
        startTransition(async () => {
            const result = await enrollStudentsInCourse(courseId, selectedIds);
            if (result.success && result.data) {
                toast.success(`Enrolled ${result.data.enrolled} student(s) successfully`);
                if (result.data.alreadyEnrolled > 0) {
                    toast.info(`${result.data.alreadyEnrolled} already enrolled`);
                }
                // Move students from available to enrolled
                const toMove = available.filter(s => selectedIds.includes(s.id));
                setEnrolled(prev => [...prev, ...toMove.map(s => ({
                    ...s, status: "ACTIVE", enrolledAt: new Date().toISOString(),
                    totalSessions: 0, presentCount: 0,
                }))])
                setAvailable(prev => prev.filter(s => !selectedIds.includes(s.id)));
                setSelectedIds([]);
                setDialogOpen(false);
            } else {
                toast.error(result.error || "Failed to enroll students");
            }
        });
    }

    function handleUnenroll(studentId: string, studentName: string) {
        startTransition(async () => {
            const result = await unenrollStudentFromCourse(courseId, studentId);
            if (result.success) {
                toast.success(`${studentName} removed from course`);
                const removed = enrolled.find(s => s.id === studentId);
                if (removed) {
                    setAvailable(prev => [...prev, removed]);
                    setEnrolled(prev => prev.filter(s => s.id !== studentId));
                }
            } else {
                toast.error(result.error || "Failed to remove student");
            }
        });
    }

    return (
        <div className="space-y-6">
            <Link href="/dashboard/courses">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Courses
                </Button>
            </Link>

            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Course Roster</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {courseName} · {enrolled.length} student{enrolled.length !== 1 ? "s" : ""} enrolled
                    </p>
                </div>
                <Button onClick={() => { setAddSearch(""); setSelectedIds([]); setDialogOpen(true); }} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Enroll Students
                </Button>
            </div>

            {/* Enrolled table */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center gap-3">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                        placeholder="Search enrolled students…"
                        value={enrollSearch}
                        onChange={e => setEnrollSearch(e.target.value)}
                        className="border-0 shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Face</TableHead>
                            <TableHead>Attendance</TableHead>
                            <TableHead>Enrolled</TableHead>
                            <TableHead className="w-16"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEnrolled.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    {enrollSearch ? "No students match your search" : "No students enrolled yet"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEnrolled.map(student => {
                                const rate = student.totalSessions > 0
                                    ? Math.round((student.presentCount / student.totalSessions) * 100)
                                    : null;
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <Link
                                                href={`/dashboard/students/${student.id}`}
                                                className="font-medium hover:underline text-sm"
                                            >
                                                {student.firstName} {student.lastName}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">{student.email}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {student.studentRefId}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {student.faceEnrolled
                                                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                : <XCircle className="h-4 w-4 text-gray-400" />
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {rate !== null
                                                ? <span className={`text-sm font-medium ${rate < 75 ? "text-red-500" : "text-green-600"}`}>{rate}%</span>
                                                : <span className="text-muted-foreground text-sm">—</span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(student.enrolledAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                disabled={isPending}
                                                onClick={() => handleUnenroll(student.id, `${student.firstName} ${student.lastName}`)}
                                                title="Remove from course"
                                            >
                                                <UserMinus className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Students Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Enroll Students</DialogTitle>
                    </DialogHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students…"
                            className="pl-9"
                            value={addSearch}
                            onChange={e => setAddSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1 min-h-0">
                        {filteredAvailable.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground text-sm">
                                {addSearch ? "No students match search" : "All students are already enrolled"}
                            </p>
                        ) : (
                            filteredAvailable.map(student => (
                                <label
                                    key={student.id}
                                    className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(student.id)}
                                        onCheckedChange={() => toggleSelect(student.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{student.email} · {student.studentRefId}</p>
                                    </div>
                                    {student.faceEnrolled && (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                    )}
                                </label>
                            ))
                        )}
                    </div>
                    <DialogFooter className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground mr-auto">
                            {selectedIds.length} selected
                        </span>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEnroll} disabled={selectedIds.length === 0 || isPending}>
                            Enroll Selected
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
