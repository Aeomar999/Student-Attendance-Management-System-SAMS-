"use server"

import { auth } from "@/lib/auth"
import { queryRaw } from "@/lib/prisma"
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

interface RoomResult {
    id: string;
    name: string;
    building: string | null;
    capacity: number;
    description: string | null;
    status: string;
    institution_id: string;
    institution_name: string | null;
    created_at: Date;
    schedule_count: number | null;
}

export async function getRooms(institutionId?: string): Promise<RoomRow[]> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const whereClause = institutionId ? "WHERE r.institution_id = $1" : ""
    const params = institutionId ? [institutionId] : []

    const rooms = await queryRaw<RoomResult>(`
        SELECT 
            r.id, r.name, r.building, r.capacity, r.description, r.status,
            r.institution_id, i.name as institution_name, r.created_at,
            COUNT(s.id)::int as schedule_count
        FROM rooms r
        LEFT JOIN institutions i ON r.institution_id = i.id
        LEFT JOIN schedules s ON r.id = s.room_id
        ${whereClause}
        GROUP BY r.id, i.name, r.created_at
        ORDER BY r.building ASC, r.name ASC
    `, params)

    return rooms.map(r => ({
        id: r.id,
        name: r.name,
        building: r.building,
        capacity: r.capacity,
        description: r.description,
        status: r.status,
        institutionId: r.institution_id,
        institutionName: r.institution_name ?? undefined,
        createdAt: r.created_at,
        _count: { schedules: r.schedule_count ?? 0 },
    }))
}

export async function getRoomById(id: string): Promise<RoomRow | null> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const rooms = await queryRaw<RoomResult>(`
        SELECT 
            r.id, r.name, r.building, r.capacity, r.description, r.status,
            r.institution_id, i.name as institution_name, r.created_at,
            COUNT(s.id)::int as schedule_count
        FROM rooms r
        LEFT JOIN institutions i ON r.institution_id = i.id
        LEFT JOIN schedules s ON r.id = s.room_id
        WHERE r.id = $1
        GROUP BY r.id, i.name, r.created_at
    `, [id])

    if (!rooms[0]) return null

    const r = rooms[0]
    return {
        id: r.id,
        name: r.name,
        building: r.building,
        capacity: r.capacity,
        description: r.description,
        status: r.status,
        institutionId: r.institution_id,
        institutionName: r.institution_name ?? undefined,
        createdAt: r.created_at,
        _count: { schedules: r.schedule_count ?? 0 },
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

    const result = await queryRaw<{ id: string }>(`
        INSERT INTO rooms (id, name, building, capacity, description, status, institution_id, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVE', $5, NOW(), NOW())
        RETURNING id
    `, [data.name, data.building ?? null, data.capacity, data.description ?? null, data.institutionId])

    if (!result[0]) {
        return { success: false, error: "Failed to create room" }
    }

    revalidatePath("/dashboard/rooms")
    return { success: true }
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

    const sets: string[] = []
    const params: unknown[] = []
    let idx = 1

    if (data.name !== undefined) { sets.push(`name = $${idx++}`); params.push(data.name) }
    if (data.building !== undefined) { sets.push(`building = $${idx++}`); params.push(data.building) }
    if (data.capacity !== undefined) { sets.push(`capacity = $${idx++}`); params.push(data.capacity) }
    if (data.description !== undefined) { sets.push(`description = $${idx++}`); params.push(data.description) }
    if (data.status !== undefined) { sets.push(`status = $${idx++}`); params.push(data.status) }
    sets.push(`updated_at = NOW()`)
    params.push(id)

    if (sets.length > 1) {
        await queryRaw(`UPDATE rooms SET ${sets.join(", ")} WHERE id = $${idx}`, params)
    }

    revalidatePath("/dashboard/rooms")
    revalidatePath(`/dashboard/rooms/${id}`)
    return { success: true }
}

export async function deleteRoom(id: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Forbidden: Only admins can delete rooms")
    }

    const rooms = await queryRaw<{ schedule_count: number }>(`
        SELECT COUNT(s.id)::int as schedule_count
        FROM rooms r
        LEFT JOIN schedules s ON r.id = s.room_id
        WHERE r.id = $1
        GROUP BY r.id
    `, [id])

    if (rooms[0] && rooms[0].schedule_count > 0) {
        return { success: false, error: "Cannot delete room with existing schedules" }
    }

    await queryRaw(`DELETE FROM rooms WHERE id = $1`, [id])

    revalidatePath("/dashboard/rooms")
    return { success: true }
}
