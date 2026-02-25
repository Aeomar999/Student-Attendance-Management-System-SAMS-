"use client";

import { useState, useRef, useCallback } from "react";
import { Trash2, Edit, ScanFace, Camera, UserPlus } from "lucide-react";
import { toast } from "sonner";
import Webcam from "react-webcam";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    createStudent,
    updateStudent,
    deleteStudent
} from "@/app/actions/student";

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

                if (result.success && result.data) {
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

                if (result.success && result.data) {
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
                                            <span className="font-medium">{student.firstName} {student.lastName}</span>
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
