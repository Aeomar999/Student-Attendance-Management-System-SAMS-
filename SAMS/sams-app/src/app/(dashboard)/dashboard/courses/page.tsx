import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getCourses, getLecturers, getDepartmentsByInstitution } from "@/app/actions/course"
import { queryRaw } from "@/lib/prisma"
import { CourseClient } from "./course-client"

interface UserRow {
    id: string;
    institution_id: string | null;
}

export default async function CoursesPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/login")
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    const users = await queryRaw<UserRow>(
        "SELECT id, institution_id FROM users WHERE id = $1",
        [session.user.id]
    )
    const user = users[0]
    const institutionId = user?.institution_id ?? ""

    const [coursesResult, lecturersResult, departmentsResult] = await Promise.all([
        getCourses(),
        getLecturers(),
        institutionId ? getDepartmentsByInstitution(institutionId) : Promise.resolve({ success: true, data: [] }),
    ])

    return (
        <div className="flex-1 space-y-4">
            <CourseClient
                initialCourses={coursesResult.success ? (coursesResult.data ?? []) : []}
                lecturers={lecturersResult.success ? (lecturersResult.data ?? []) : []}
                departments={departmentsResult.success ? (departmentsResult.data ?? []) : []}
                institutionId={institutionId}
            />
        </div>
    )
}
