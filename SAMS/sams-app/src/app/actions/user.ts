"use server"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { hash } from "@node-rs/argon2"
import { randomBytes } from "crypto"

const userSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "LECTURER"]),
    departmentId: z.string().optional(),
})

const updateUserSchema = userSchema.partial()

async function requireAdmin() {
    const session = await auth()
    const role = session?.user?.role
    if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
        throw new Error("Unauthorized: Admin access required.")
    }
    return session
}

export async function getUsers() {
    await requireAdmin()
    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(
                `SELECT id, first_name as "firstName", last_name as "lastName", email, role, status, created_at as "createdAt"
                FROM users ORDER BY created_at DESC`
            )
            return result.rows
        })
        return { success: true, data: rows }
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return { success: false, error: "Failed to fetch users" }
    }
}

export async function createUser(data: z.infer<typeof userSchema>) {
    await requireAdmin()
    try {
        const v = userSchema.parse(data)
        const result = await withDb(async (db) => {
            const existing = await db.query("SELECT id FROM users WHERE email=$1", [v.email])
            if (existing.rows.length > 0) return null
            const ins = await db.query(
                `INSERT INTO users (id, first_name, last_name, email, role, status, mfa_enabled, failed_attempts, created_at, updated_at)
                VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVE', false, 0, NOW(), NOW())
                RETURNING id, email, first_name as "firstName", last_name as "lastName", role`,
                [v.firstName, v.lastName, v.email, v.role]
            )
            return ins.rows[0]
        })
        if (!result) return { success: false, error: "Email already in use" }

        const token = randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
        console.log("[DEBUG] Creating token for:", result.email, "expiresAt:", expiresAt)
        await withDb(db => db.query(
            `INSERT INTO setup_tokens (id, token, email, expires_at, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
            [token, result.email, expiresAt]
        ))

        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/setup-account?token=${token}`
        console.warn(`[EMAIL MOCK] Setup link for ${result.email}: ${magicLink}`)

        revalidatePath("/dashboard/users")
        return { success: true, data: result, magicLink }
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false, error: error.issues?.[0]?.message || "Validation failed" }
        console.error("Failed to create user:", error)
        return { success: false, error: "Failed to create user" }
    }
}

export async function updateUser(id: string, data: z.infer<typeof updateUserSchema>) {
    await requireAdmin()
    try {
        const v = updateUserSchema.parse(data)
        const sets: string[] = []
        const vals: unknown[] = []
        let idx = 1
        if (v.firstName !== undefined) { sets.push(`first_name=$${idx++}`); vals.push(v.firstName) }
        if (v.lastName !== undefined) { sets.push(`last_name=$${idx++}`); vals.push(v.lastName) }
        if (v.email !== undefined) { sets.push(`email=$${idx++}`); vals.push(v.email) }
        if (v.role !== undefined) { sets.push(`role=$${idx++}`); vals.push(v.role) }
        sets.push(`updated_at=NOW()`)
        vals.push(id)
        await withDb(db => db.query(`UPDATE users SET ${sets.join(", ")} WHERE id=$${idx}`, vals))
        revalidatePath("/dashboard/users")
        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false, error: error.issues?.[0]?.message || "Validation failed" }
        console.error("Failed to update user:", error)
        return { success: false, error: "Failed to update user" }
    }
}

export async function deleteUser(id: string) {
    const session = await requireAdmin()
    if (session.user.id === id) return { success: false, error: "Cannot delete your own account" }
    try {
        await withDb(db => db.query("DELETE FROM users WHERE id=$1", [id]))
        revalidatePath("/dashboard/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete user:", error)
        return { success: false, error: "Failed to delete user" }
    }
}

export async function suspendUser(id: string) {
    const session = await requireAdmin()
    if (session.user.id === id) return { success: false, error: "Cannot suspend your own account" }
    try {
        await withDb(db => db.query(
            "UPDATE users SET status='SUSPENDED', updated_at=NOW() WHERE id=$1",
            [id]
        ))
        revalidatePath("/dashboard/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to suspend user:", error)
        return { success: false, error: "Failed to suspend user" }
    }
}

export async function activateUser(id: string) {
    await requireAdmin()
    try {
        await withDb(db => db.query(
            "UPDATE users SET status='ACTIVE', failed_attempts=0, locked_until=NULL, updated_at=NOW() WHERE id=$1",
            [id]
        ))
        revalidatePath("/dashboard/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to activate user:", error)
        return { success: false, error: "Failed to activate user" }
    }
}

export async function adminSendPasswordReset(id: string) {
    await requireAdmin()
    try {
        const email = await withDb(async (db) => {
            const result = await db.query("SELECT email FROM users WHERE id=$1", [id])
            return result.rows[0]?.email as string | undefined
        })
        if (!email) return { success: false, error: "User not found" }

        const token = randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        await withDb(db => db.query(
            `INSERT INTO setup_tokens (id, token, email, expires_at, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
            [token, email, expiresAt]
        ))

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/setup-account?token=${token}`
        console.warn(`[EMAIL MOCK] Password reset link for ${email}: ${resetLink}`)

        return { success: true, data: { resetLink, email } }
    } catch (error) {
        console.error("Failed to generate reset link:", error)
        return { success: false, error: "Failed to generate reset link" }
    }
}

export async function resetUserPassword(id: string, newPassword: string) {
    await requireAdmin()
    try {
        const passwordHash = await hash(newPassword)
        await withDb(db => db.query("UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2", [passwordHash, id]))
        revalidatePath("/dashboard/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to reset password:", error)
        return { success: false, error: "Failed to reset password" }
    }
}
