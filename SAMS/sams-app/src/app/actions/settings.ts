"use server"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { verify, hash } from "@node-rs/argon2"
import * as OTPAuth from "otpauth"
import * as QRCode from "qrcode"

async function requireAuth() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(12, "Password must be at least 12 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[a-z]/, "Must contain a lowercase letter")
        .regex(/[0-9]/, "Must contain a number")
        .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
})

export async function getCurrentUser() {
    const session = await requireAuth()
    try {
        const user = await withDb(async (db) => {
            const result = await db.query(
                `SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, status,
                mfa_enabled AS "mfaEnabled", created_at AS "createdAt", last_login_at AS "lastLoginAt"
                FROM users WHERE id=$1`,
                [session.user.id]
            )
            return result.rows[0]
        })
        return { success: true, data: user }
    } catch (error) {
        console.error("Failed to fetch user:", error)
        return { success: false, error: "Failed to load profile" }
    }
}

export async function updateProfile(data: z.infer<typeof profileSchema>) {
    const session = await requireAuth()
    try {
        const v = profileSchema.parse(data)
        await withDb(db => db.query(
            "UPDATE users SET first_name=$1, last_name=$2, updated_at=NOW() WHERE id=$3",
            [v.firstName, v.lastName, session.user.id]
        ))
        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false, error: error.issues[0]?.message || "Validation failed" }
        console.error("Failed to update profile:", error)
        return { success: false, error: "Failed to update profile" }
    }
}

export async function changePassword(data: z.infer<typeof passwordSchema>) {
    const session = await requireAuth()
    try {
        const v = passwordSchema.parse(data)
        const user = await withDb(async (db) => {
            const result = await db.query("SELECT password_hash FROM users WHERE id=$1", [session.user.id])
            return result.rows[0]
        })
        if (!user?.password_hash) return { success: false, error: "Account has no password set" }

        const isValid = await verify(user.password_hash, v.currentPassword)
        if (!isValid) return { success: false, error: "Current password is incorrect" }

        const newHash = await hash(v.newPassword)
        await withDb(db => db.query(
            "UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2",
            [newHash, session.user.id]
        ))
        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false, error: error.issues[0]?.message || "Validation failed" }
        console.error("Failed to change password:", error)
        return { success: false, error: "Failed to change password" }
    }
}

export async function getMfaStatus() {
    const session = await requireAuth()
    try {
        const user = await withDb(async (db) => {
            const result = await db.query("SELECT mfa_enabled AS \"mfaEnabled\" FROM users WHERE id=$1", [session.user.id])
            return result.rows[0]
        })
        return { success: true, data: { mfaEnabled: user?.mfaEnabled || false, methods: user?.mfaEnabled ? ["TOTP Authenticator"] : [] } }
    } catch {
        return { success: false, error: "Failed to fetch MFA status" }
    }
}

export async function generateMfaSetup() {
    try {
        const session = await requireAuth()
        
        const totp = new OTPAuth.TOTP({
            issuer: "SAMS",
            label: session.user.email || "User",
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: new OTPAuth.Secret({ size: 20 }),
        })

        const secret = totp.secret.base32
        const otpauth = totp.toString()
        
        const qrDataUri = await QRCode.toDataURL(otpauth, {
            width: 200,
            margin: 2,
            color: {
                dark: "#1976D2",
                light: "#FFFFFF",
            },
        })

        return { success: true, data: { secret, qrDataUri } }
    } catch {
        return { success: false, error: "Failed to generate MFA setup" }
    }
}

export async function enableMfa(code: string, secret?: string) {
    const session = await requireAuth()
    if (code.length !== 6) return { success: false, error: "Invalid verification code" }
    
    try {
        // Get the stored MFA credential secret if available
        let storedSecret = secret
        
        if (!storedSecret) {
            // If no secret provided, check if there's a stored one
            const credentials = await withDb(async (db) => {
                const result = await db.query(
                    "SELECT credential_data FROM mfa_credentials WHERE user_id = $1 AND type = 'TOTP'",
                    [session.user.id]
                )
                return result.rows[0]
            })
            
            if (credentials?.credential_data) {
                const credData = JSON.parse(credentials.credential_data)
                storedSecret = credData.secret
            }
        }

        if (storedSecret) {
            // Verify the TOTP code
            const totp = new OTPAuth.TOTP({
                issuer: "SAMS",
                label: session.user.email || "User",
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(storedSecret),
            })

            const delta = totp.validate({ token: code, window: 1 })
            if (delta === null) {
                return { success: false, error: "Invalid verification code" }
            }
        }

        await withDb(db => db.query("UPDATE users SET mfa_enabled=true, updated_at=NOW() WHERE id=$1", [session.user.id]))
        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch {
        return { success: false, error: "Failed to enable MFA" }
    }
}

export async function disableMfa(password: string) {
    const session = await requireAuth()
    try {
        const user = await withDb(async (db) => {
            const result = await db.query("SELECT password_hash FROM users WHERE id=$1", [session.user.id])
            return result.rows[0]
        })

        const isValid = await verify(user?.password_hash || "", password)
        if (!isValid) return { success: false, error: "Incorrect password" }

        await withDb(db => db.query("UPDATE users SET mfa_enabled=false, updated_at=NOW() WHERE id=$1", [session.user.id]))
        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch {
        return { success: false, error: "Failed to disable MFA" }
    }
}
