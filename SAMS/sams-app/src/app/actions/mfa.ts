"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateTotpSecret, generateBackupCodes, verifyTotp, getTotpUri } from "@/lib/mfa";
import { revalidatePath } from "next/cache";

export async function setupMfa() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const existing = await prisma.mfaCredential.findFirst({
        where: { userId: session.user.id, type: "totp" },
    });

    if (existing?.verified) {
        return { success: false, error: "MFA already enabled" };
    }

    const secret = generateTotpSecret();
    const backupCodes = generateBackupCodes(10);
    const email = session.user.email ?? "";

    const uri = getTotpUri(secret, email);

    await prisma.mfaCredential.upsert({
        where: { userId_type: { userId: session.user.id, type: "totp" } },
        create: {
            userId: session.user.id,
            type: "totp",
            secret,
            backupCodes,
            verified: false,
        },
        update: {
            secret,
            backupCodes,
            verified: false,
        },
    });

    return {
        success: true,
        data: {
            secret,
            uri,
            backupCodes,
        },
    };
}

export async function verifyMfaSetup(code: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const credential = await prisma.mfaCredential.findFirst({
        where: { userId: session.user.id, type: "totp" },
    });

    if (!credential) {
        return { success: false, error: "MFA not set up" };
    }

    const isValid = verifyTotp(credential.secret, code);

    if (!isValid) {
        return { success: false, error: "Invalid code" };
    }

    await prisma.mfaCredential.update({
        where: { id: credential.id },
        data: { verified: true },
    });

    await prisma.user.update({
        where: { id: session.user.id },
        data: { mfaEnabled: true },
    });

    revalidatePath("/dashboard/settings");

    return { success: true };
}

export async function verifyMfaCode(code: string, userId: string) {
    const credential = await prisma.mfaCredential.findFirst({
        where: { userId, type: "totp" },
    });

    if (!credential) {
        return { success: false, error: "MFA not configured" };
    }

    if (credential.backupCodes.map((c: string) => c.replace("-", "")).includes(code.replace("-", "").toUpperCase())) {
        return { success: true, isBackupCode: true };
    }

    const isValid = verifyTotp(credential.secret, code);

    if (!isValid) {
        await prisma.user.update({
            where: { id: userId },
            data: { failedAttempts: { increment: 1 } },
        });
        return { success: false, error: "Invalid code" };
    }

    return { success: true };
}

export async function disableMfa(password: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        return { success: false, error: "User not found" };
    }

    const { verifyPassword } = await import("@/lib/password");
    const valid = await verifyPassword(password, user.passwordHash ?? "");

    if (!valid) {
        return { success: false, error: "Invalid password" };
    }

    await prisma.mfaCredential.deleteMany({
        where: { userId: session.user.id },
    });

    await prisma.user.update({
        where: { id: session.user.id },
        data: { mfaEnabled: false },
    });

    revalidatePath("/dashboard/settings");

    return { success: true };
}

export async function getMfaStatus() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const credential = await prisma.mfaCredential.findFirst({
        where: { userId: session.user.id, type: "totp" },
    });

    return {
        success: true,
        data: {
            enabled: credential?.verified ?? false,
            type: credential?.type ?? null,
        },
    };
}
