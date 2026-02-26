import { getCourseStudents, getStudentsNotInCourse } from "@/app/actions/course"
import { getCourses } from "@/app/actions/course"
import { EnrollmentClient } from "./enrollment-client"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    return { title: "Course Enrollment — SAMS" }
}

export default async function CourseEnrollmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Verify course exists
    const courses = await getCourses()
    const course = courses.success && courses.data
        ? courses.data.find(c => c.id === id)
        : null
    if (!course) return notFound()

    const [enrolledResult, availableResult] = await Promise.all([
        getCourseStudents(id),
        getStudentsNotInCourse(id),
    ])

    return (
        <EnrollmentClient
            courseId={id}
            courseName={`${course.code} — ${course.name}`}
            initialEnrolled={enrolledResult.success && enrolledResult.data ? enrolledResult.data : []}
            initialAvailable={availableResult.success && availableResult.data ? availableResult.data : []}
        />
    )
}
