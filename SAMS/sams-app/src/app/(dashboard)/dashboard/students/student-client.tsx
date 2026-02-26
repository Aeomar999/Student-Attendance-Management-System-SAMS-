"use client";

import { useState, useRef, useCallback } from "react";
import { Trash2, Edit, ScanFace, Camera, UserPlus, Upload, Loader2, HelpCircle, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import Webcam from "react-webcam";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import {
    createStudent,
    updateStudent,
    deleteStudent
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
    const [students, setStudents] = useState<StudentType[]>(initialStudents);
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
    const [institutionId, setInstitutionId] = useState("INST-001");
    const [departmentId, setDepartmentId] = useState("DEPT-CS");

    // Face Capture states
    const [isCapturing, setIsCapturing] = useState(false);
    const [faceImageSrc, setFaceImageSrc] = useState<string | null>(null);
    const webcamRef = useRef<Webcam>(null);

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setStudentId("");
        setYearOfStudy(1);
        setProgram("");
        setInstitutionId("INST-001");
        setDepartmentId("DEPT-CS");
        setEditingStudent(null);
        setIsCapturing(false);
        setFaceImageSrc(null);
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

    const captureFace = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setFaceImageSrc(imageSrc);
            setIsCapturing(false);
            toast.success("Face image captured successfully!");
        } else {
            toast.error("Failed to capture image. Please ensure camera access is granted.");
        }
    }, [webcamRef]);

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
                    if (faceImageSrc) {
                        toast.info("Face enrollment mock submitted to FR engine");
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

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        setIsLoading(true);
        try {
            const result = await deleteStudent(id);
            if (result.success) {
                toast.success("Student deleted successfully");
                setStudents(students.filter(s => s.id !== id));
            } else {
                toast.error(result.error || "Failed to delete student");
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
            <div className="flex items-center justify-between">
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
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
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
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-muted">
                                                    <th className="border px-3 py-2 text-left font-medium">Column</th>
                                                    <th className="border px-3 py-2 text-left font-medium">Data Type</th>
                                                    <th className="border px-3 py-2 text-left font-medium">Required</th>
                                                    <th className="border px-3 py-2 text-left font-medium">Validation Rules</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border px-3 py-2 font-mono text-[#1976D2]">studentId</td>
                                                    <td className="border px-3 py-2">String</td>
                                                    <td className="border px-3 py-2 text-[#F44336]">Yes</td>
                                                    <td className="border px-3 py-2">Unique, alphanumeric</td>
                                                </tr>
                                                <tr>
                                                    <td className="border px-3 py-2 font-mono text-[#1976D2]">firstName</td>
                                                    <td className="border px-3 py-2">String</td>
                                                    <td className="border px-3 py-2 text-[#F44336]">Yes</td>
                                                    <td className="border px-3 py-2">1-100 characters</td>
                                                </tr>
                                                <tr>
                                                    <td className="border px-3 py-2 font-mono text-[#1976D2]">lastName</td>
                                                    <td className="border px-3 py-2">String</td>
                                                    <td className="border px-3 py-2 text-[#F44336]">Yes</td>
                                                    <td className="border px-3 py-2">1-100 characters</td>
                                                </tr>
                                                <tr>
                                                    <td className="border px-3 py-2 font-mono text-[#1976D2]">email</td>
                                                    <td className="border px-3 py-2">String</td>
                                                    <td className="border px-3 py-2 text-[#F44336]">Yes</td>
                                                    <td className="border px-3 py-2">Valid email format, unique</td>
                                                </tr>
                                                <tr>
                                                    <td className="border px-3 py-2 font-mono text-[#1976D2]">program</td>
                                                    <td className="border px-3 py-2">String</td>
                                                    <td className="border px-3 py-2 text-[#F44336]">Yes</td>
                                                    <td className="border px-3 py-2">e.g., Computer Science, Engineering</td>
                                                </tr>
                                                <tr>
                                                    <td className="border px-3 py-2 font-mono text-[#1976D2]">yearOfStudy</td>
                                                    <td className="border px-3 py-2">Integer</td>
                                                    <td className="border px-3 py-2 text-[#F44336]">Yes</td>
                                                    <td className="border px-3 py-2">1-6 (defaults to 1 if invalid)</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Sample CSV Data:</h4>
                                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto border">
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
                    <input
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
                    <Button variant="outline" disabled={isImporting} onClick={() => fileInputRef.current?.click()}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Import CSV
                    </Button>
                    <Sheet open={isSheetOpen} onOpenChange={(open) => {
                        setIsSheetOpen(open);
                        if (!open) resetForm();
                    }}>
                        <SheetTrigger asChild>
                            <Button onClick={handleOpenNew}>
                                <UserPlus className="mr-2 h-4 w-4" /> Add Student
                            </Button>
                        </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
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
                                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="studentId">Student ID</Label>
                                    <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} required disabled={isLoading || !!editingStudent} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || !!editingStudent} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="program">Program / Major</Label>
                                    <Input id="program" value={program} onChange={(e) => setProgram(e.target.value)} required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="yearOfStudy">Year of Study</Label>
                                    <Input id="yearOfStudy" type="number" min={1} max={6} value={yearOfStudy} onChange={(e) => setYearOfStudy(parseInt(e.target.value))} required disabled={isLoading} />
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
                                    
                                    {faceImageSrc ? (
                                        <div className="space-y-3">
                                            <div className="relative rounded-md overflow-hidden border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={faceImageSrc} alt="Face Capture" className="w-full h-auto object-cover" />
                                            </div>
                                            <Button type="button" variant="outline" className="w-full" onClick={() => setFaceImageSrc(null)}>
                                                Retake Photo
                                            </Button>
                                        </div>
                                    ) : isCapturing ? (
                                        <div className="space-y-3">
                                            <div className="relative rounded-md overflow-hidden bg-black aspect-video flex items-center justify-center">
                                                <Webcam
                                                    audio={false}
                                                    ref={webcamRef}
                                                    screenshotFormat="image/jpeg"
                                                    videoConstraints={{ facingMode: "user" }}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCapturing(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="button" className="flex-1" onClick={captureFace}>
                                                    Snap Photo
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button type="button" variant="secondary" className="w-full h-24 border-dashed border-2" onClick={() => setIsCapturing(true)}>
                                            <div className="flex flex-col items-center gap-2">
                                                <Camera className="h-6 w-6" />
                                                <span>Click to capture face enrollment data</span>
                                            </div>
                                        </Button>
                                    )}
                                </div>
                            )}
                            
                            <div className="pt-6 flex justify-end gap-2 border-t">
                                <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading || (!editingStudent && !faceImageSrc)}>
                                    {isLoading ? "Saving..." : editingStudent ? "Update Student" : "Enroll Student"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Students
                    </div>
                    <div className="mt-1 text-2xl font-bold">{students.length}</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Face Enrolled
                    </div>
                    <div className="mt-1 text-2xl font-bold text-green-500">{enrolledCount}</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pending Enrollment
                    </div>
                    <div className="mt-1 text-2xl font-bold text-amber-500">{students.length - enrolledCount}</div>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name / Email</TableHead>
                            <TableHead>Program (Year)</TableHead>
                            <TableHead>Face Enrolled</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No students found. Add a student to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-mono text-sm font-medium">{student.studentId}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Link
                                                href={`/dashboard/students/${student.id}`}
                                                className="font-medium hover:underline text-primary"
                                            >
                                                {student.firstName} {student.lastName}
                                            </Link>
                                            <span className="text-sm text-muted-foreground">{student.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {student.program} <span className="text-muted-foreground">(Yr {student.yearOfStudy})</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <ScanFace className={`h-4 w-4 ${student.faceEnrolled ? "text-green-500" : "text-amber-500"}`} />
                                            <span className={`text-sm ${student.faceEnrolled ? "text-green-500" : "text-amber-500"}`}>
                                                {student.faceEnrolled ? "Yes" : "Pending"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"} className={student.status === "ACTIVE" ? "bg-green-600" : ""}>
                                            {student.status.toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleOpenEdit(student)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
