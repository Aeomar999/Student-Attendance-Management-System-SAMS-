"use server";

import { prisma } from "@/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    role: z.nativeEnum(UserRole),
    password: z.string().min(12),
});

const updateUserSchema = z.object({
    id: z.string(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
});

export async function getUsers(params?: {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
}) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
        ...(params?.search && {
            OR: [
                { firstName: { contains: params.search, mode: "insensitive" as const } },
                { lastName: { contains: params.search, mode: "insensitive" as const } },
                { email: { contains: params.search, mode: "insensitive" as const } },
            ],
        }),
        ...(params?.role && { role: params.role }),
        ...(params?.status && { status: params.status }),
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                mfaEnabled: true,
                lastLoginAt: true,
                createdAt: true,
            },
        }),
        prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
}

export async function createUser(formData: FormData) {
    const raw = {
        email: formData.get("email") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        role: formData.get("role") as UserRole,
        password: formData.get("password") as string,
    };

    const parsed = createUserSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const { email, firstName, lastName, role, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: { email: ["A user with this email already exists"] } };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: { email, firstName, lastName, role, passwordHash },
    });

    revalidatePath("/dashboard/users");
    return { success: true, user };
}

export async function updateUser(formData: FormData) {
    const raw = {
        id: formData.get("id") as string,
        firstName: formData.get("firstName") as string | undefined,
        lastName: formData.get("lastName") as string | undefined,
        role: formData.get("role") as UserRole | undefined,
        status: formData.get("status") as UserStatus | undefined,
    };

    const parsed = updateUserSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const { id, ...data } = parsed.data;

    const user = await prisma.user.update({
        where: { id },
        data: { ...data },
    });

    revalidatePath("/dashboard/users");
    return { success: true, user };
}

export async function suspendUser(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.SUSPENDED },
    });
    revalidatePath("/dashboard/users");
    return { success: true };
}

export async function activateUser(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.ACTIVE },
    });
    revalidatePath("/dashboard/users");
    return { success: true };
}
