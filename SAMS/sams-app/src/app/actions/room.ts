"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type RoomRow = {
    id: string
    name: string
    building: string | null
    capacity: number
    description: string | null
    status: string
    institutionId: string
    institutionName?: string
    createdAt: Date
    _count?: { schedules: number }
}

export async function getRooms(institutionId?: string): Promise<RoomRow[]> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const where = institutionId ? { institutionId } : {}

    const rooms = await prisma.room.findMany({
        where,
        include: {
            institution: { select: { name: true } },
            _count: { select: { schedules: true } },
        },
        orderBy: [{ building: "asc" }, { name: "asc" }],
    })

    return rooms.map(r => ({
        id: r.id,
        name: r.name,
        building: r.building,
        capacity: r.capacity,
        description: r.description,
        status: r.status,
        institutionId: r.institutionId,
        institutionName: r.institution.name,
        createdAt: r.createdAt,
        _count: r._count,
    }))
}

export async function getRoomById(id: string): Promise<RoomRow | null> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const room = await prisma.room.findUnique({
        where: { id },
        include: {
            institution: { select: { name: true } },
            _count: { select: { schedules: true } },
        },
    })

    if (!room) return null

    return {
        id: room.id,
        name: room.name,
        building: room.building,
        capacity: room.capacity,
        description: room.description,
        status: room.status,
        institutionId: room.institutionId,
        institutionName: room.institution.name,
        createdAt: room.createdAt,
        _count: room._count,
    }
}

export async function createRoom(data: {
    name: string
    building?: string
    capacity: number
    description?: string
    institutionId: string
}): Promise<{ success: boolean; data?: RoomRow; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Forbidden: Only admins can create rooms")
    }

    const room = await prisma.room.create({
        data: {
            name: data.name,
            building: data.building,
            capacity: data.capacity,
            description: data.description,
            institutionId: data.institutionId,
        },
    })

    revalidatePath("/dashboard/rooms")
    return { success: true, data: room }
}

export async function updateRoom(
    id: string,
    data: { name?: string; building?: string; capacity?: number; description?: string; status?: string }
): Promise<{ success: boolean; data?: RoomRow; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Forbidden: Only admins can update rooms")
    }

    const room = await prisma.room.update({
        where: { id },
        data,
    })

    revalidatePath("/dashboard/rooms")
    revalidatePath(`/dashboard/rooms/${id}`)
    return { success: true, data: room }
}

export async function deleteRoom(id: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Forbidden: Only admins can delete rooms")
    }

    const hasSchedules = await prisma.room.findUnique({
        where: { id },
        include: { _count: { select: { schedules: true } } },
    })

    if (hasSchedules && hasSchedules._count.schedules > 0) {
        return { success: false, error: "Cannot delete room with existing schedules" } as const
    }

    await prisma.room.delete({ where: { id } })

    revalidatePath("/dashboard/rooms")
    return { success: true }
}
