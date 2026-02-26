"use client";

import { useTransition, useState, useMemo, useCallback, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, ScanFace, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteStudent } from "@/actions/students";
import { toast } from "sonner";

interface Student {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    yearOfStudy: number;
    program: string;
    status: string;
    faceEnrolled: boolean;
    createdAt: Date;
}

interface StudentTableProps {
    students: Student[];
}

const PAGE_SIZE = 20;

const StudentRow = memo(function StudentRow({ 
    student, 
    onDelete,
    isPending 
}: { 
    student: Student; 
    onDelete: (id: string, name: string) => void;
    isPending: boolean;
}) {
    return (
        <TableRow>
            <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
            <TableCell className="font-medium">
                {student.firstName} {student.lastName}
            </TableCell>
            <TableCell className="text-muted-foreground">{student.email}</TableCell>
            <TableCell>{student.program}</TableCell>
            <TableCell>Year {student.yearOfStudy}</TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    <ScanFace
                        className={`h-4 w-4 ${student.faceEnrolled ? "text-green-500" : "text-muted-foreground"}`}
                    />
                    <span className={`text-sm ${student.faceEnrolled ? "text-green-500" : "text-muted-foreground"}`}>
                        {student.faceEnrolled ? "Enrolled" : "Pending"}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant={student.status === "ACTIVE" ? "default" : "destructive"}>
                    {student.status}
                </Badge>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isPending}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(student.id, `${student.firstName} ${student.lastName}`)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
});

export function StudentTable({ students }: StudentTableProps) {
    const [isPending, startTransition] = useTransition();
    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(students.length / PAGE_SIZE);
    
    const paginatedStudents = useMemo(() => {
        const start = page * PAGE_SIZE;
        return students.slice(start, start + PAGE_SIZE);
    }, [students, page]);

    const handleDelete = useCallback((studentId: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;
        startTransition(async () => {
            const result = await deleteStudent(studentId);
            if (result.success) {
                toast.success(`${name} removed successfully`);
            } else {
                toast.error("Failed to remove student");
            }
        });
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    if (students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-muted-foreground text-sm">No students found.</p>
                <p className="text-xs text-muted-foreground mt-1">Add a student to get started.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Face Enrolled</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedStudents.map((student) => (
                            <StudentRow 
                                key={student.id} 
                                student={student} 
                                onDelete={handleDelete}
                                isPending={isPending}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, students.length)} of {students.length} students
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                            Page {page + 1} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
