import { getStudentAttendanceHistory } from "@/app/actions/attendance"
import { StudentDetailClient } from "./student-detail-client"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    return { title: "Student Profile — SAMS" }
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const result = await getStudentAttendanceHistory(id)
    if (!result.success || !result.data?.student) return notFound()
    return <StudentDetailClient data={result.data} />
}
