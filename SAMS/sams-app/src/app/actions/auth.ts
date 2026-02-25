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
