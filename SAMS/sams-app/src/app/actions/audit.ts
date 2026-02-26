"use server"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"

async function requireAdmin() {
    const session = await auth()
    const role = session?.user?.role
    if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
        throw new Error("Unauthorized: Admin access required.")
    }
    return session
}

export type AuditLogRow = {
    id: string
    userId: string | null
    userName: string | null
    action: string
    entityType: string | null
    entityId: string | null
    details: Record<string, unknown> | null
    createdAt: string
}

export async function getAuditLogs({
    search = "",
    action = "",
    limit = 50,
    offset = 0,
}: {
    search?: string
    action?: string
    limit?: number
    offset?: number
}) {
    await requireAdmin()
    try {
        const data = await withDb(async (db) => {
            const conditions: string[] = []
            const params: unknown[] = []
            let idx = 1

            if (search) {
                conditions.push(`(CONCAT(u.first_name, ' ', u.last_name) ILIKE $${idx} OR al.entity_id::text ILIKE $${idx})`)
                params.push(`%${search}%`)
                idx++
            }
            if (action) {
                conditions.push(`al.action = $${idx++}`)
                params.push(action)
            }

            const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

            const [rows, countResult] = await Promise.all([
                db.query(
                    `SELECT
                        al.id,
                        al.user_id AS "userId",
                        CONCAT(u.first_name, ' ', u.last_name) AS "userName",
                        al.action,
                        al.entity_type AS "entityType",
                        al.entity_id AS "entityId",
                        al.details,
                        al.created_at AS "createdAt"
                    FROM audit_logs al
                    LEFT JOIN users u ON al.user_id = u.id
                    ${where}
                    ORDER BY al.created_at DESC
                    LIMIT $${idx} OFFSET $${idx + 1}`,
                    [...params, limit, offset]
                ),
                db.query(
                    `SELECT COUNT(*)::int AS total FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ${where}`,
                    params
                ),
            ])

            return {
                logs: rows.rows as AuditLogRow[],
                total: countResult.rows[0]?.total ?? 0,
            }
        })
        return { success: true, data }
    } catch (error) {
        console.error("Failed to fetch audit logs:", error)
        return { success: false, error: "Failed to fetch audit logs" }
    }
}
