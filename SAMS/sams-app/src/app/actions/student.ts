"use server"

import { logAuditEvent } from "@/lib/audit-logger"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const studentSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    studentId: z.string().min(1, "Student ID is required"),
    yearOfStudy: z.coerce.number().min(1).max(6),
    program: z.string().min(1, "Program is required"),
    institutionId: z.string().min(1, "Institution ID is required"),
    departmentId: z.string().min(1, "Department ID is required"),
})

const updateStudentSchema = studentSchema.partial()

async function requireAuth() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized access.")
    return session
}

export async function getStudents() {
    await requireAuth()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(
                `SELECT id, student_id as "studentId", first_name as "firstName", last_name as "lastName",
                email, year_of_study as "yearOfStudy", program, status,
                face_enrolled as "faceEnrolled", institution_id as "institutionId",
                department_id as "departmentId", created_at as "createdAt", updated_at as "updatedAt"
                FROM students ORDER BY created_at DESC`
            )
            return result.rows
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to fetch students:", error)
        return { success: false, error: "Failed to fetch students" }
    }
}

export async function createStudent(data: z.infer<typeof studentSchema>) {
    await requireAuth()
    try {
        const v = studentSchema.parse(data)
        const result = await withDb(async (db) => {
            const existing = await db.query("SELECT id FROM students WHERE email=$1 OR student_id=$2", [v.email, v.studentId])
            if (existing.rows.length > 0) return null
            const ins = await db.query(
                `INSERT INTO students (id, student_id, first_name, last_name, email, year_of_study, program, institution_id, department_id, status, face_enrolled, created_at, updated_at)
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', false, NOW(), NOW())
                RETURNING id, student_id as "studentId", first_name as "firstName", last_name as "lastName", email`,
                [v.studentId, v.firstName, v.lastName, v.email, v.yearOfStudy, v.program, v.institutionId, v.departmentId]
            )
            return ins.rows[0]
        })
        if (!result) return { success: false, error: "Email or Student ID already exists" }

        await logAuditEvent({
            userId: (await auth())?.user?.id ?? null,
            action: "CREATE",
            entityType: "STUDENT",
            entityId: result.id,
            details: { studentId: v.studentId, email: v.email },
        })

        revalidatePath("/dashboard/students")
        return { success: true, data: result }
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false, error: error.issues?.[0]?.message || "Validation failed" }
        console.error("Failed to create student:", error)
        return { success: false, error: "Failed to create student" }
    }
}

export async function updateStudent(id: string, data: z.infer<typeof updateStudentSchema>) {
    await requireAuth()
    try {
        const v = updateStudentSchema.parse(data)
        const sets: string[] = []
        const vals: unknown[] = []
        let idx = 1
        if (v.firstName !== undefined) { sets.push(`first_name=$${idx++}`); vals.push(v.firstName) }
        if (v.lastName !== undefined) { sets.push(`last_name=$${idx++}`); vals.push(v.lastName) }
        if (v.email !== undefined) { sets.push(`email=$${idx++}`); vals.push(v.email) }
        if (v.yearOfStudy !== undefined) { sets.push(`year_of_study=$${idx++}`); vals.push(v.yearOfStudy) }
        if (v.program !== undefined) { sets.push(`program=$${idx++}`); vals.push(v.program) }
        sets.push(`updated_at=NOW()`)
        vals.push(id)
        const result = await withDb(db => db.query(
            `UPDATE students SET ${sets.join(", ")} WHERE id=$${idx} RETURNING id`,
            vals
        ))
        if (result.rows.length === 0) return { success: false, error: "Student not found" }

        await logAuditEvent({
            userId: (await auth())?.user?.id ?? null,
            action: "UPDATE",
            entityType: "STUDENT",
            entityId: id,
            details: { updatedFields: Object.keys(v) },
        })

        revalidatePath("/dashboard/students")
        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false, error: error.issues?.[0]?.message || "Validation failed" }
        console.error("Failed to update student:", error)
        return { success: false, error: "Failed to update student" }
    }
}

export async function deleteStudent(id: string) {
    await requireAuth()
    try {
        await withDb(db => db.query("DELETE FROM students WHERE id=$1", [id]))

        await logAuditEvent({
            userId: (await auth())?.user?.id ?? null,
            action: "DELETE",
            entityType: "STUDENT",
            entityId: id,
        })

        revalidatePath("/dashboard/students")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete student:", error)
        return { success: false, error: "Failed to delete student" }
    }
}
