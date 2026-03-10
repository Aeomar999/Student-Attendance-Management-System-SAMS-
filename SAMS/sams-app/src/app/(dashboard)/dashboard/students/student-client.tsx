"use client";

import { useState, useRef } from "react";
import { UserPlus, ScanFace, Loader2, Upload, HelpCircle, FileText, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { FaceEnrollment } from "@/components/students/face-enrollment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { StudentTable } from "@/components/students/student-table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    createStudent,
    updateStudent
} from "@/app/actions/student";
import { importStudentsCSV } from "@/app/actions/student-import";

type StudentType = {
    id: string;
    studentId: string;
    email: string;
    firstName: string;
    lastName: string;
    yearOfStudy: number;
    program: string;
    status: string;
    faceEnrolled: boolean;
    createdAt: Date;
    institutionId: string;
    departmentId: string;
};

export function StudentClient({ 
    initialStudents, 
}: { 
    initialStudents: StudentType[];
}) {
    const [students] = useState<StudentType[]>(initialStudents);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [studentId, setStudentId] = useState("");
    const [yearOfStudy, setYearOfStudy] = useState(1);
    const [program, setProgram] = useState("");
    const [institutionId, setInstitutionId] = useState("06aeb9ae-11c6-4954-8d64-0f9e11b8f770");
    const [departmentId, setDepartmentId] = useState("a77556bb-7492-4e1b-93e6-cccf82d8ed96");

    // Face Capture states
    const [isCapturing, setIsCapturing] = useState(false);
    const [faceImages, setFaceImages] = useState<string[]>([]);

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setStudentId("");
        setYearOfStudy(1);
        setProgram("");
        setInstitutionId("06aeb9ae-11c6-4954-8d64-0f9e11b8f770");
        setDepartmentId("a77556bb-7492-4e1b-93e6-cccf82d8ed96");
        setEditingStudent(null);
        setIsCapturing(false);
        setFaceImages([]);
    };

    const handleOpenEdit = (student: StudentType) => {
        setEditingStudent(student);
        setFirstName(student.firstName);
        setLastName(student.lastName);
        setEmail(student.email);
        setStudentId(student.studentId);
        setYearOfStudy(student.yearOfStudy);
        setProgram(student.program);
        setInstitutionId(student.institutionId);
        setDepartmentId(student.departmentId);
        setIsSheetOpen(true);
    };

    const handleOpenNew = () => {
        resetForm();
        setIsSheetOpen(true);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // NOTE: In a complete implementation, `faceImageSrc` (base64) would be sent
            // to the Python Facial Recognition engine to generate an embedding.
            // For now, if an image is provided, we simulate enrollment.

            if (editingStudent) {
                const result = await updateStudent(editingStudent.id, {
                    firstName,
                    lastName,
                    email,
                    studentId,
                    yearOfStudy,
                    program,
                    institutionId,
                    departmentId,
                });

                if (result.success && "data" in result && result.data) {
                    toast.success("Student updated successfully");
                    window.location.reload(); 
                    setIsSheetOpen(false);
                } else {
                    toast.error(result.error || "Failed to update student");
                }
            } else {
                const result = await createStudent({
                    firstName,
                    lastName,
                    email,
                    studentId,
                    yearOfStudy,
                    program,
                    institutionId,
                    departmentId,
                });

                if (result.success && "data" in result && result.data) {
                    toast.success("Student created successfully");
                    if (faceImages.length > 0) {
                        toast.info(`Face enrollment mock submitted to FR engine (${faceImages.length} angles)`);
                        // Mock hitting the FastAPI /register endpoint
                    }
                    window.location.reload();
                    setIsSheetOpen(false);
                } else {
                    toast.error(result.error || "Failed to create student");
                }
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const enrolledCount = students.filter(s => s.faceEnrolled).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <ScanFace className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage student enrollment and face data
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" >
                                <HelpCircle className="mr-2 h-4 w-4" />
                                CSV Format
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#1976D2]" />
                                    CSV Import Format Specification
                                </DialogTitle>
                                <DialogDescription>
                                    Use the following format when preparing your CSV file for bulk student import.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Required Column Headers:</h4>
                                    <div className="overflow-x-auto rounded-md border">
                                        <Table className="w-full text-sm border-collapse">
                                            <TableHeader>
                                                <TableRow className="bg-muted hover:bg-muted">
                                                    <TableHead className="border px-3 py-2 text-left font-semibold text-foreground">Column</TableHead>
                                                    <TableHead className="border px-3 py-2 text-left font-semibold text-foreground">Data Type</TableHead>
                                                    <TableHead className="border px-3 py-2 text-left font-semibold text-foreground">Required</TableHead>
                                                    <TableHead className="border px-3 py-2 text-left font-semibold text-foreground">Validation Rules</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="border px-3 py-2 font-mono text-[#1976D2]">studentId</TableCell>
                                                    <TableCell className="border px-3 py-2">String</TableCell>
                                                    <TableCell className="border px-3 py-2 text-[#F44336]">Yes</TableCell>
                                                    <TableCell className="border px-3 py-2">Unique, alphanumeric</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="border px-3 py-2 font-mono text-[#1976D2]">firstName</TableCell>
                                                    <TableCell className="border px-3 py-2">String</TableCell>
                                                    <TableCell className="border px-3 py-2 text-[#F44336]">Yes</TableCell>
                                                    <TableCell className="border px-3 py-2">1-100 characters</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="border px-3 py-2 font-mono text-[#1976D2]">lastName</TableCell>
                                                    <TableCell className="border px-3 py-2">String</TableCell>
                                                    <TableCell className="border px-3 py-2 text-[#F44336]">Yes</TableCell>
                                                    <TableCell className="border px-3 py-2">1-100 characters</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="border px-3 py-2 font-mono text-[#1976D2]">email</TableCell>
                                                    <TableCell className="border px-3 py-2">String</TableCell>
                                                    <TableCell className="border px-3 py-2 text-[#F44336]">Yes</TableCell>
                                                    <TableCell className="border px-3 py-2">Valid email format, unique</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="border px-3 py-2 font-mono text-[#1976D2]">program</TableCell>
                                                    <TableCell className="border px-3 py-2">String</TableCell>
                                                    <TableCell className="border px-3 py-2 text-[#F44336]">Yes</TableCell>
                                                    <TableCell className="border px-3 py-2">e.g., Computer Science, Engineering</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="border px-3 py-2 font-mono text-[#1976D2]">yearOfStudy</TableCell>
                                                    <TableCell className="border px-3 py-2">Integer</TableCell>
                                                    <TableCell className="border px-3 py-2 text-[#F44336]">Yes</TableCell>
                                                    <TableCell className="border px-3 py-2">1-6 (defaults to 1 if invalid)</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 text-sm text-foreground/80">Sample CSV Data:</h4>
                                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto border text-muted-foreground">
{`studentId,firstName,lastName,email,program,yearOfStudy
STU001,John,Doe,john.doe@example.com,Computer Science,1
STU002,Jane,Smith,jane.smith@example.com,Engineering,2
STU003,Bob,Johnson,bob.johnson@example.com,Mathematics,3`}
                                    </pre>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Important Notes:</h4>
                                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                        <li>First row must contain the column headers exactly as shown above</li>
                                        <li>Email addresses must be unique - duplicates will fail</li>
                                        <li>Student IDs must be unique - duplicates will fail</li>
                                        <li>Year of Study will default to 1 if invalid or missing</li>
                                        <li>No special characters allowed in names</li>
                                        <li>Maximum 1000 students per import</li>
                                    </ul>
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="outline" onClick={() => {
                                        const csvContent = "studentId,firstName,lastName,email,program,yearOfStudy\nSTU001,John,Doe,john.doe@example.com,Computer Science,1";
                                        const blob = new Blob([csvContent], { type: 'text/csv' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'student_template.csv';
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Template
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Input
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsImporting(true);
                            try {
                                const text = await file.text();
                                const result = await importStudentsCSV(text);
                                if (result.success && result.data) {
                                    toast.success(`Imported ${result.data.imported} students. ${result.data.failed > 0 ? `${result.data.failed} failed.` : ''}`);
                                    if (result.data.errors.length > 0) {
                                        console.error("CSV Import errors:", result.data.errors);
                                    }
                                    window.location.reload();
                                } else {
                                    toast.error(result.error || "Failed to import CSV");
                                }
                            } catch {
                                toast.error("An error occurred during import");
                            } finally {
                                setIsImporting(false);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }
                        }}
                    />
                    <Button variant="outline" disabled={isImporting} onClick={() => fileInputRef.current?.click()} >
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Import CSV
                    </Button>
                    <Sheet open={isSheetOpen} onOpenChange={(open) => {
                        setIsSheetOpen(open);
                        if (!open) resetForm();
                    }}>
                        <SheetTrigger asChild>
                            <Button onClick={handleOpenNew} >
                                <UserPlus className="mr-2 h-4 w-4" /> Add Student
                            </Button>
                        </SheetTrigger>
                    <SheetContent className="overflow-y-auto overflow-x-hidden">
                        <SheetHeader>
                            <SheetTitle>{editingStudent ? "Edit Student" : "Register Student"}</SheetTitle>
                            <SheetDescription>
                                {editingStudent ? "Update student details." : "Enter details and capture a reference photo for facial recognition."}
                            </SheetDescription>
                        </SheetHeader>
                        
                        <form onSubmit={onSubmit} className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" placeholder="e.g. John" aria-label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" placeholder="e.g. Doe" aria-label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="studentId">Student ID</Label>
                                    <Input id="studentId" placeholder="e.g. STU123456" aria-label="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} required disabled={isLoading || !!editingStudent} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="e.g. john.doe@example.com" aria-label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || !!editingStudent} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="program">Program / Major</Label>
                                    <Input id="program" placeholder="e.g. Computer Science" aria-label="Program or Major" value={program} onChange={(e) => setProgram(e.target.value)} required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="yearOfStudy">Year of Study</Label>
                                    <Input id="yearOfStudy" type="number" min={1} max={6} placeholder="e.g. 1" aria-label="Year of Study" value={yearOfStudy} onChange={(e) => setYearOfStudy(parseInt(e.target.value))} required disabled={isLoading} />
                                </div>
                            </div>

                            {/* Database-required placeholders */}
                            <div className="hidden">
                                <Input id="institutionId" value={institutionId} onChange={(e) => setInstitutionId(e.target.value)} />
                                <Input id="departmentId" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} />
                            </div>

                            {/* Face Capture Section */}
                            {!editingStudent && (
                                <div className="space-y-4 pt-4 border-t">
                                    <Label className="text-base">Facial Recognition Setup</Label>
                                    
                                    {faceImages.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                                <div className="bg-primary/10 p-2 rounded-full text-primary">
                                                    <CheckCircle2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-primary">Enrollment Complete</p>
                                                    <p className="text-xs text-muted-foreground">{faceImages.length} facial angles captured.</p>
                                                </div>
                                            </div>
                                            <Button type="button" variant="outline" className="w-full" onClick={() => setFaceImages([])}>
                                                Retake Face ID
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button type="button" variant="secondary" aria-label="Click to capture face enrollment data" className="w-full h-24 border-dashed border-2 hover:bg-muted/50 transition-colors" onClick={() => setIsCapturing(true)}>
                                            <div className="flex flex-col items-center gap-2">
                                                <ScanFace className="h-6 w-6 text-muted-foreground" />
                                                <span className="text-sm font-medium text-muted-foreground">Setup Face ID</span>
                                            </div>
                                        </Button>
                                    )}
                                </div>
                            )}
                            
                            {isCapturing && (
                                <FaceEnrollment 
                                    onComplete={(images) => {
                                        setFaceImages(images);
                                        setIsCapturing(false);
                                    }}
                                    onCancel={() => setIsCapturing(false)}
                                />
                            )}
                            
                            <div className="pt-6 flex justify-end gap-2 border-t">
                                <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading || (!editingStudent && faceImages.length === 0)}>
                                    {isLoading ? "Saving..." : editingStudent ? "Update Student" : "Enroll Student"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/10 border-primary/30 shadow-sm transition-all duration-300 relative overflow-hidden group">
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-xs font-medium text-primary uppercase tracking-wider">
                            Total Students
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-primary">{students.length}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Face Enrolled
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-primary">{enrolledCount}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Pending Enrollment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{students.length - enrolledCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                <StudentTable 
                    students={students as any} 
                    onEdit={(student) => handleOpenEdit(student as any)} 
                    onOpenNew={handleOpenNew}
                />
                {/* eslint-enable @typescript-eslint/no-explicit-any */}
            </div>
        </div>
    );
}
