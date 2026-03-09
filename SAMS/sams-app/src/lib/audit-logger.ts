"use server"

import { withDb } from "@/lib/db"

export type AuditAction =
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "LOGIN"
    | "LOGOUT"
    | "FAILED_LOGIN"
    | "SUSPEND"
    | "ACTIVATE"

/**
 * Writes an entry to the audit_logs table.
 *
 * Designed to be fire-and-forget — errors are logged but never thrown,
 * so audit logging cannot break the primary action.
 *
 * @param userId - The user performing the action (null for system events)
 * @param action - One of the AuditAction types
 * @param entityType - The type of entity acted on (e.g. "USER", "COURSE")
 * @param entityId - The ID of the entity acted on
 * @param details - Optional JSON-serializable details about the action
 */
export async function logAuditEvent({
    userId,
    action,
    entityType,
    entityId,
    details,
}: {
    userId: string | null
    action: AuditAction
    entityType: string
    entityId: string | null
    details?: Record<string, unknown>
}): Promise<void> {
    try {
        await withDb(async (db) => {
            await db.query(
                `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, created_at)
                 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
                [
                    userId,
                    action,
                    entityType,
                    entityId,
                    details ? JSON.stringify(details) : null,
                ]
            )
        })
    } catch (error) {
        // Never let audit logging break the primary action
        console.error("[AUDIT] Failed to write audit log:", error)
    }
}
