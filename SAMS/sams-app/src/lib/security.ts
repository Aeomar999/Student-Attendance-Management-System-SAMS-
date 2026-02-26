import { prisma } from "@/lib/prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export async function checkAccountLockout(userId: string): Promise<{
    locked: boolean;
    lockedUntil: Date | null;
    reason?: string;
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lockedUntil: true, failedAttempts: true, status: true },
    });

    if (!user) {
        return { locked: false, lockedUntil: null };
    }

    if (user.status === "SUSPENDED") {
        return {
            locked: true,
            lockedUntil: null,
            reason: "Account has been suspended",
        };
    }

    if (user.lockedUntil && new Date() < user.lockedUntil) {
        return {
            locked: true,
            lockedUntil: user.lockedUntil,
            reason: `Account is locked due to too many failed attempts. Try again later.`,
        };
    }

    if (user.lockedUntil && new Date() >= user.lockedUntil) {
        await prisma.user.update({
            where: { id: userId },
            data: { lockedUntil: null },
        });
        return { locked: false, lockedUntil: null };
    }

    return { locked: false, lockedUntil: null };
}

export async function recordFailedLogin(userId: string): Promise<{
    shouldLock: boolean;
    lockedUntil: Date | null;
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { failedAttempts: true },
    });

    if (!user) {
        return { shouldLock: false, lockedUntil: null };
    }

    const newFailedAttempts = user.failedAttempts + 1;
    
    let shouldLock = false;
    let lockedUntil: Date | null = null;

    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        shouldLock = true;
        const lockoutMultiplier = Math.floor((newFailedAttempts - MAX_FAILED_ATTEMPTS) / 2) + 1;
        lockedUntil = new Date(
            Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000 * Math.min(lockoutMultiplier, 4)
        );

        await prisma.user.update({
            where: { id: userId },
            data: {
                failedAttempts: newFailedAttempts,
                lockedUntil,
            },
        });
    } else {
        await prisma.user.update({
            where: { id: userId },
            data: { failedAttempts: newFailedAttempts },
        });
    }

    return { shouldLock, lockedUntil };
}

export async function clearFailedLoginAttempts(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            failedAttempts: 0,
            lockedUntil: null,
        },
    });
}

export async function recordSuccessfulLogin(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            lastLoginAt: new Date(),
            failedAttempts: 0,
            lockedUntil: null,
        },
    });
}
