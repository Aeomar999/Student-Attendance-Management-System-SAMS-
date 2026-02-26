"use server"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"
import { revalidatePath } from "next/cache"

async function requireAuth() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

export type Notification = {
    id: string
    title: string
    message: string
    type: "INFO" | "WARNING" | "ALERT" | "SUCCESS"
    isRead: boolean
    link: string | null
    createdAt: string
}

export async function getNotifications(): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
    const session = await requireAuth()
    const userId = session.user?.id
    if (!userId) return { success: false, error: "No user ID" }

    try {
        const rows = await withDb(async (db) => {
            const result = await db.query(`
                SELECT id, title, message, type,
                       is_read AS "isRead",
                       link,
                       created_at AS "createdAt"
                FROM notifications
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT 50
            `, [userId])
            return result.rows
        })
        return { success: true, data: rows as Notification[] }
    } catch (error) {
        console.error("Failed to fetch notifications:", error)
        return { success: false, error: "Failed to fetch notifications" }
    }
}

export async function getUnreadCount(): Promise<{ success: boolean; count?: number }> {
    const session = await requireAuth()
    const userId = session.user?.id
    if (!userId) return { success: false }

    try {
        const count = await withDb(async (db) => {
            const result = await db.query(
                `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
                [userId]
            )
            return parseInt(result.rows[0].count)
        })
        return { success: true, count }
    } catch {
        return { success: false, count: 0 }
    }
}

export async function markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    const session = await requireAuth()
    const userId = session.user?.id
    if (!userId) return { success: false }

    try {
        await withDb(async (db) => {
            await db.query(
                `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
                [notificationId, userId]
            )
        })
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to mark notification as read:", error)
        return { success: false }
    }
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
    const session = await requireAuth()
    const userId = session.user?.id
    if (!userId) return { success: false }

    try {
        await withDb(async (db) => {
            await db.query(
                `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
                [userId]
            )
        })
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error)
        return { success: false }
    }
}
