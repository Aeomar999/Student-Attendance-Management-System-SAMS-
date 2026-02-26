"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type DepartmentRow = {
    id: string
    name: string
    code: string
    description: string | null
    institutionId: string
    institutionName?: string
    createdAt: Date
    _count?: { users: number; students: number; courses: number }
}

export async function getDepartments(institutionId?: string): Promise<DepartmentRow[]> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const where = institutionId ? { institutionId } : {}

    const departments = await prisma.department.findMany({
        where,
        include: {
            institution: { select: { name: true } },
            _count: { select: { users: true, students: true, courses: true } },
        },
        orderBy: { name: "asc" },
    })

    return departments.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description,
        institutionId: d.institutionId,
        institutionName: d.institution.name,
        createdAt: d.createdAt,
        _count: d._count,
    }))
}

export async function getDepartmentById(id: string): Promise<DepartmentRow | null> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const department = await prisma.department.findUnique({
        where: { id },
        include: {
            institution: { select: { name: true } },
            _count: { select: { users: true, students: true, courses: true } },
        },
    })

    if (!department) return null

    return {
        id: department.id,
        name: department.name,
        code: department.code,
        description: department.description,
        institutionId: department.institutionId,
        institutionName: department.institution.name,
        createdAt: department.createdAt,
        _count: department._count,
    }
}

export async function createDepartment(data: {
    name: string
    code: string
    description?: string
    institutionId: string
}): Promise<{ success: boolean; data?: DepartmentRow; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Forbidden: Only admins can create departments")
    }

    const existing = await prisma.department.findUnique({
        where: { code: data.code },
    })
    if (existing) {
        return { success: false, error: "Department code already exists" } as const
    }

    const department = await prisma.department.create({
        data: {
            name: data.name,
            code: data.code,
            description: data.description,
            institutionId: data.institutionId,
        },
    })

    revalidatePath("/dashboard/departments")
    return { success: true, data: department }
}

export async function updateDepartment(
    id: string,
    data: { name?: string; description?: string }
): Promise<{ success: boolean; data?: DepartmentRow; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Forbidden: Only admins can update departments")
    }

    const department = await prisma.department.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
        },
    })

    revalidatePath("/dashboard/departments")
    revalidatePath(`/dashboard/departments/${id}`)
    return { success: true, data: department }
}

export async function deleteDepartment(id: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Forbidden: Only admins can delete departments")
    }

    const hasRelations = await prisma.department.findUnique({
        where: { id },
        include: {
            _count: { select: { users: true, students: true, courses: true } },
        },
    })

    if (hasRelations && (hasRelations._count.users > 0 || hasRelations._count.students > 0 || hasRelations._count.courses > 0)) {
        return { success: false, error: "Cannot delete department with existing users, students, or courses" } as const
    }

    await prisma.department.delete({ where: { id } })

    revalidatePath("/dashboard/departments")
    return { success: true }
}
