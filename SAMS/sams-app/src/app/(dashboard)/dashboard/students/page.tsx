import { Metadata } from "next";
import { getStudents } from "@/app/actions/student";
import { StudentClient } from "./student-client";

export const metadata: Metadata = {
    title: "Student Management | SAMS",
    description: "Manage enrolled students and face capture records",
};

export default async function StudentsPage() {
    const { data: students, success } = await getStudents();

    if (!success) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
                <div className="text-destructive">Failed to load students.</div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <StudentClient initialStudents={students || []} />
        </div>
    );
}
