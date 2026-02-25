"use client";

import { useTransition } from "react";
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
import { MoreHorizontal, Trash2, ScanFace } from "lucide-react";
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

export function StudentTable({ students }: StudentTableProps) {
    const [isPending, startTransition] = useTransition();

    function handleDelete(studentId: string, name: string) {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;
        startTransition(async () => {
            const result = await deleteStudent(studentId);
            if (result.success) {
                toast.success(`${name} removed successfully`);
            } else {
                toast.error("Failed to remove student");
            }
        });
    }

    if (students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-muted-foreground text-sm">No students found.</p>
                <p className="text-xs text-muted-foreground mt-1">Add a student to get started.</p>
            </div>
        );
    }

    return (
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
                    {students.map((student) => (
                        <TableRow key={student.id}>
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
                                            onClick={() =>
                                                handleDelete(student.id, `${student.firstName} ${student.lastName}`)
                                            }
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
