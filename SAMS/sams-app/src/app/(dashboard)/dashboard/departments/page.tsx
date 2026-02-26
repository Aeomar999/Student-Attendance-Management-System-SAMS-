import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDepartments } from "@/app/actions/department"
import { prisma } from "@/lib/prisma"
import { DepartmentClient } from "./departments-client"

export default async function DepartmentsPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/login")
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { institutionId: true }
    })

    const institutionId = user?.institutionId ?? "default"

    const departments = await getDepartments(institutionId)

    return (
        <DepartmentClient
            departments={departments}
            institutionId={institutionId}
            institutionName="SAMS University"
        />
    )
}
