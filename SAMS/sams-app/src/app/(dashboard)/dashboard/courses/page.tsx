import { Metadata } from "next"
import { getCourses, getLecturers } from "@/app/actions/course"
import { CourseClient } from "./course-client"

export const metadata: Metadata = {
    title: "Courses | SAMS",
    description: "Manage courses and lecturer assignments",
}

export default async function CoursesPage() {
    const [coursesResult, lecturersResult] = await Promise.all([
        getCourses(),
        getLecturers(),
    ])

    return (
        <div className="flex-1 space-y-4">
            <CourseClient
                initialCourses={coursesResult.success ? (coursesResult.data ?? []) : []}
                lecturers={lecturersResult.success ? (lecturersResult.data ?? []) : []}
            />
        </div>
    )
}
