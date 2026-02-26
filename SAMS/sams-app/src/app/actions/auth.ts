"use server";

import { prisma } from "@/lib/prisma";
import * as argon2 from "@node-rs/argon2";

export async function getSetupTokenDetails(token: string) {
    try {
        // TypeScript compiler in CI sometimes misses generated types immediately
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const setupToken = await prisma.setupToken.findUnique({
            where: { token },
        });

        if (!setupToken) {
            return { success: false, error: "Token not found" };
        }

        if (new Date() > setupToken.expiresAt) {
            return { success: false, error: "Setup link has expired" };
        }

        return {
            success: true,
            data: { email: setupToken.email }
        };
    } catch (error) {
        console.error("Error retrieving setup token:", error);
        return { success: false, error: "Failed to verify setup link" };
    }
}

export async function verifyAndSetupAccount(token: string, password: string) {
    try {
        // TypeScript compiler in CI sometimes misses generated types immediately
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const setupToken = await prisma.setupToken.findUnique({
            where: { token },
        });

        if (!setupToken) {
            return { success: false, error: "Token not found or invalid" };
        }

        if (new Date() > setupToken.expiresAt) {
            return { success: false, error: "Setup link has expired" };
        }

        // Hash the new password securely
        const hashedPassword = await argon2.hash(password);

        // Update the user's password using the email from the token
        await prisma.user.update({
            where: { email: setupToken.email },
            data: { passwordHash: hashedPassword },
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await prisma.setupToken.delete({
            where: { id: setupToken.id },
        });

        return { success: true };
    } catch (error) {
        console.error("Error setting up account:", error);
        return { success: false, error: "Failed to complete account setup" };
    }
}

export async function requestPasswordReset(email: string) {
    try {
        // Always return success to prevent email enumeration attacks
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true },
        });

        if (!user) {
            return { success: true, message: "If an account exists with that email, a reset link has been sent." };
        }

        // Generate a secure token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store token — upsert to allow only one active token per user
        await prisma.$executeRaw`
            INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
            VALUES (gen_random_uuid(), ${user.id}::uuid, ${token}, ${expiresAt}, NOW())
            ON CONFLICT (user_id) DO UPDATE SET token = ${token}, expires_at = ${expiresAt}, created_at = NOW()
        `;

        // In production, send email here. For now, log the reset URL.
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
        console.warn(`[SAMS] Password reset link for ${user.email}: ${resetUrl}`);

        return { success: true, message: "If an account exists with that email, a reset link has been sent." };
    } catch (error) {
        console.error("Password reset request failed:", error);
        return { success: false, error: "An unexpected error occurred. Please try again." };
    }
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
    try {
        if (!token || !newPassword) {
            return { success: false, error: "Token and new password are required." };
        }

        if (newPassword.length < 8) {
            return { success: false, error: "Password must be at least 8 characters long." };
        }

        // Look up the token
        const rows = await prisma.$queryRaw<Array<{ id: string; user_id: string; expires_at: Date }>>`
            SELECT id, user_id, expires_at FROM password_reset_tokens WHERE token = ${token} LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return { success: false, error: "Invalid or expired reset link." };
        }

        const resetRecord = rows[0]!;

        if (new Date() > new Date(resetRecord.expires_at)) {
            // Clean up expired token
            await prisma.$executeRaw`DELETE FROM password_reset_tokens WHERE id = ${resetRecord.id}::uuid`;
            return { success: false, error: "This reset link has expired. Please request a new one." };
        }

        // Hash and update password
        const hashedPassword = await argon2.hash(newPassword);

        await prisma.user.update({
            where: { id: resetRecord.user_id },
            data: {
                passwordHash: hashedPassword,
                failedAttempts: 0,
                lockedUntil: null,
            },
        });

        // Delete the used token
        await prisma.$executeRaw`DELETE FROM password_reset_tokens WHERE id = ${resetRecord.id}::uuid`;

        return { success: true, message: "Your password has been reset. You can now log in." };
    } catch (error) {
        console.error("Password reset failed:", error);
        return { success: false, error: "Failed to reset password. Please try again." };
    }
}
