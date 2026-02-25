"use server";

import { prisma } from "@/lib/prisma";
import { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createStudentSchema = z.object({
    studentId: z.string().min(1),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    yearOfStudy: z.coerce.number().min(1).max(8),
    program: z.string().min(1),
    institutionId: z.string().min(1),
    departmentId: z.string().min(1),
});

const updateStudentSchema = z.object({
    id: z.string(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    yearOfStudy: z.coerce.number().min(1).max(8).optional(),
    program: z.string().min(1).optional(),
    status: z.nativeEnum(UserStatus).optional(),
});

export async function getStudents(params?: {
    search?: string;
    status?: UserStatus;
    program?: string;
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
                { studentId: { contains: params.search, mode: "insensitive" as const } },
            ],
        }),
        ...(params?.status && { status: params.status }),
        ...(params?.program && { program: params.program }),
    };

    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.student.count({ where }),
    ]);

    return { students, total, page, limit };
}

export async function createStudent(formData: FormData) {
    const raw = {
        studentId: formData.get("studentId") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        yearOfStudy: formData.get("yearOfStudy"),
        program: formData.get("program") as string,
        institutionId: formData.get("institutionId") as string,
        departmentId: formData.get("departmentId") as string,
    };

    const parsed = createStudentSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const existing = await prisma.student.findFirst({
        where: {
            OR: [
                { studentId: parsed.data.studentId },
                { email: parsed.data.email },
            ],
        },
    });

    if (existing) {
        return { error: { studentId: ["A student with this ID or email already exists"] } };
    }

    const student = await prisma.student.create({ data: parsed.data });

    revalidatePath("/dashboard/students");
    return { success: true, student };
}

export async function updateStudent(formData: FormData) {
    const raw = {
        id: formData.get("id") as string,
        firstName: formData.get("firstName") as string | undefined,
        lastName: formData.get("lastName") as string | undefined,
        yearOfStudy: formData.get("yearOfStudy") ?? undefined,
        program: formData.get("program") as string | undefined,
        status: formData.get("status") as UserStatus | undefined,
    };

    const parsed = updateStudentSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const { id, ...data } = parsed.data;
    const student = await prisma.student.update({ where: { id }, data });

    revalidatePath("/dashboard/students");
    return { success: true, student };
}

export async function deleteStudent(studentId: string) {
    await prisma.student.delete({ where: { id: studentId } });
    revalidatePath("/dashboard/students");
    return { success: true };
}
