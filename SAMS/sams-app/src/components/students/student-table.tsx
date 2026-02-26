"use client";

import { useTransition, useState, useMemo, useCallback, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Trash2, ScanFace, ChevronLeft, ChevronRight, Search, ArrowUpDown, Plus } from "lucide-react";
import { deleteStudent } from "@/actions/students";
import { toast } from "sonner";
import Link from "next/link";

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

type SortField = "studentId" | "firstName" | "lastName" | "email" | "program" | "yearOfStudy" | "status" | "faceEnrolled";
type SortDirection = "asc" | "desc";

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
        <TableRow className="hover:bg-muted/50">
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
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [faceFilter, setFaceFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<SortField>("lastName");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    }, [sortField, sortDirection]);

    const filteredStudents = useMemo(() => {
        let result = [...students];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.studentId.toLowerCase().includes(term) ||
                s.firstName.toLowerCase().includes(term) ||
                s.lastName.toLowerCase().includes(term) ||
                s.email.toLowerCase().includes(term) ||
                s.program.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter(s => s.status === statusFilter);
        }

        if (faceFilter !== "all") {
            const enrolled = faceFilter === "enrolled";
            result = result.filter(s => s.faceEnrolled === enrolled);
        }

        result.sort((a, b) => {
            let aVal: string | number | boolean = a[sortField];
            let bVal: string | number | boolean = b[sortField];
            
            if (typeof aVal === "boolean") {
                aVal = aVal ? 1 : 0;
                bVal = bVal ? 1 : 0;
            }
            
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [students, searchTerm, statusFilter, faceFilter, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
    
    const paginatedStudents = useMemo(() => {
        const start = page * PAGE_SIZE;
        return filteredStudents.slice(start, start + PAGE_SIZE);
    }, [filteredStudents, page]);

    const handleDelete = useCallback((studentId: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) return;
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

    const clearFilters = useCallback(() => {
        setSearchTerm("");
        setStatusFilter("all");
        setFaceFilter("all");
        setPage(0);
    }, []);

    const hasFilters = searchTerm || statusFilter !== "all" || faceFilter !== "all";

    if (students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                <div className="p-4 rounded-full bg-muted">
                    <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-lg font-medium">No students found</p>
                    <p className="text-sm text-muted-foreground">Get started by adding your first student.</p>
                </div>
                <Link href="/dashboard/students/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search students..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={faceFilter} onValueChange={(v) => { setFaceFilter(v); setPage(0); }}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Face Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Faces</SelectItem>
                            <SelectItem value="enrolled">Enrolled</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear filters
                        </Button>
                    )}
                    <Link href="/dashboard/students/new">
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Student
                        </Button>
                    </Link>
                </div>
            </div>
            
            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead 
                                className="cursor-pointer hover:text-foreground"
                                onClick={() => handleSort("studentId")}
                            >
                                <div className="flex items-center gap-1">
                                    Student ID
                                    {sortField === "studentId" && (
                                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer hover:text-foreground"
                                onClick={() => handleSort("lastName")}
                            >
                                <div className="flex items-center gap-1">
                                    Name
                                    {sortField === "lastName" && (
                                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead 
                                className="cursor-pointer hover:text-foreground"
                                onClick={() => handleSort("program")}
                            >
                                <div className="flex items-center gap-1">
                                    Program
                                    {sortField === "program" && (
                                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer hover:text-foreground"
                                onClick={() => handleSort("yearOfStudy")}
                            >
                                <div className="flex items-center gap-1">
                                    Year
                                    {sortField === "yearOfStudy" && (
                                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Face Enrolled</TableHead>
                            <TableHead 
                                className="cursor-pointer hover:text-foreground"
                                onClick={() => handleSort("status")}
                            >
                                <div className="flex items-center gap-1">
                                    Status
                                    {sortField === "status" && (
                                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No students match your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedStudents.map((student) => (
                                <StudentRow 
                                    key={student.id} 
                                    student={student} 
                                    onDelete={handleDelete}
                                    isPending={isPending}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground order-2 sm:order-1">
                        Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length} students
                        {hasFilters && ` (${students.length} total)`}
                    </div>
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum = i;
                                if (totalPages > 5) {
                                    if (page < 3) pageNum = i;
                                    else if (page > totalPages - 3) pageNum = totalPages - 5 + i;
                                    else pageNum = page - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={page === pageNum ? "default" : "ghost"}
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum + 1}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
