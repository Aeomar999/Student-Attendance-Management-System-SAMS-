import { Metadata } from "next";
import { BookOpen, GraduationCap, Users } from "lucide-react";

export const metadata: Metadata = {
    title: "Courses | SAMS",
    description: "Manage courses and course assignments",
};

export default function CoursesPage() {
    return (
        <div className="flex-1 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
                <p className="text-muted-foreground">Manage courses, assign lecturers, and track enrollment.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-pink-700/10 rounded-lg">
                            <BookOpen className="h-5 w-5 text-pink-700" />
                        </div>
                        <h3 className="font-semibold">Total Courses</h3>
                    </div>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Active courses</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-sky-500/10 rounded-lg">
                            <GraduationCap className="h-5 w-5 text-sky-500" />
                        </div>
                        <h3 className="font-semibold">Departments</h3>
                    </div>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Academic departments</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Users className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h3 className="font-semibold">Avg. Enrollment</h3>
                    </div>
                    <p className="text-3xl font-bold">—</p>
                    <p className="text-sm text-muted-foreground mt-1">Students per course</p>
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Course List</h3>
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                        <BookOpen className="h-10 w-10 opacity-30" />
                        <p>No courses have been added yet.</p>
                        <p className="text-sm">Courses will appear here once they are created.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
