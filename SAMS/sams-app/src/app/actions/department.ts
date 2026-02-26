"use server"

import { auth } from "@/lib/auth"
import { queryRaw } from "@/lib/prisma"
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

interface DepartmentResult {
    id: string;
    name: string;
    code: string;
    description: string | null;
    institution_id: string;
    institution_name: string | null;
    created_at: Date;
    user_count: number | null;
    student_count: number | null;
    course_count: number | null;
}

export async function getDepartments(institutionId?: string): Promise<DepartmentRow[]> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const whereClause = institutionId ? "WHERE d.institution_id = $1" : ""
    const params = institutionId ? [institutionId] : []

    const departments = await queryRaw<DepartmentResult>(`
        SELECT 
            d.id, d.name, d.code, d.description, d.institution_id, 
            i.name as institution_name, d.created_at,
            COUNT(DISTINCT u.id)::int as user_count,
            COUNT(DISTINCT s.id)::int as student_count,
            COUNT(DISTINCT c.id)::int as course_count
        FROM departments d
        LEFT JOIN institutions i ON d.institution_id = i.id
        LEFT JOIN users u ON d.id = u.department_id
        LEFT JOIN students s ON d.id = s.department_id
        LEFT JOIN courses c ON d.id = c.department_id
        ${whereClause}
        GROUP BY d.id, i.name, d.created_at
        ORDER BY d.name ASC
    `, params)

    return departments.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description,
        institutionId: d.institution_id,
        institutionName: d.institution_name ?? undefined,
        createdAt: d.created_at,
        _count: { 
            users: d.user_count ?? 0, 
            students: d.student_count ?? 0, 
            courses: d.course_count ?? 0 
        },
    }))
}

export async function getDepartmentById(id: string): Promise<DepartmentRow | null> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const departments = await queryRaw<DepartmentResult>(`
        SELECT 
            d.id, d.name, d.code, d.description, d.institution_id, 
            i.name as institution_name, d.created_at,
            COUNT(DISTINCT u.id)::int as user_count,
            COUNT(DISTINCT s.id)::int as student_count,
            COUNT(DISTINCT c.id)::int as course_count
        FROM departments d
        LEFT JOIN institutions i ON d.institution_id = i.id
        LEFT JOIN users u ON d.id = u.department_id
        LEFT JOIN students s ON d.id = s.department_id
        LEFT JOIN courses c ON d.id = c.department_id
        WHERE d.id = $1
        GROUP BY d.id, i.name, d.created_at
    `, [id])

    if (!departments[0]) return null

    const d = departments[0]
    return {
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description,
        institutionId: d.institution_id,
        institutionName: d.institution_name ?? undefined,
        createdAt: d.created_at,
        _count: { 
            users: d.user_count ?? 0, 
            students: d.student_count ?? 0, 
            courses: d.course_count ?? 0 
        },
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

    const existing = await queryRaw<{ id: string }>(
        "SELECT id FROM departments WHERE code = $1",
        [data.code]
    )
    if (existing.length > 0) {
        return { success: false, error: "Department code already exists" }
    }

    const result = await queryRaw<{ id: string }>(`
        INSERT INTO departments (id, name, code, description, institution_id, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
        RETURNING id
    `, [data.name, data.code, data.description ?? null, data.institutionId])

    if (!result[0]) {
        return { success: false, error: "Failed to create department" }
    }

    revalidatePath("/dashboard/departments")
    return { success: true }
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

    const sets: string[] = []
    const params: unknown[] = []
    let idx = 1

    if (data.name !== undefined) { sets.push(`name = $${idx++}`); params.push(data.name) }
    if (data.description !== undefined) { sets.push(`description = $${idx++}`); params.push(data.description) }
    sets.push(`updated_at = NOW()`)
    params.push(id)

    if (sets.length > 1) {
        await queryRaw(`UPDATE departments SET ${sets.join(", ")} WHERE id = $${idx}`, params)
    }

    revalidatePath("/dashboard/departments")
    revalidatePath(`/dashboard/departments/${id}`)
    return { success: true }
}

export async function deleteDepartment(id: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Forbidden: Only admins can delete departments")
    }

    const counts = await queryRaw<{ user_count: number; student_count: number; course_count: number }>(`
        SELECT 
            (SELECT COUNT(*)::int FROM users WHERE department_id = $1) as user_count,
            (SELECT COUNT(*)::int FROM students WHERE department_id = $1) as student_count,
            (SELECT COUNT(*)::int FROM courses WHERE department_id = $1) as course_count
    `, [id])

    if (counts[0] && (counts[0].user_count > 0 || counts[0].student_count > 0 || counts[0].course_count > 0)) {
        return { success: false, error: "Cannot delete department with existing users, students, or courses" }
    }

    await queryRaw(`DELETE FROM departments WHERE id = $1`, [id])

    revalidatePath("/dashboard/departments")
    return { success: true }
}
