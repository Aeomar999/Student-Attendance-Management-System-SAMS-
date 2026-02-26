import { getAuditLogs } from "@/app/actions/audit"
import { AuditLogsClient } from "./audit-logs-client"

export const dynamic = "force-dynamic"
export const metadata = { title: "Audit Logs — SAMS" }

export default async function AuditLogsPage() {
    const result = await getAuditLogs({ limit: 50, offset: 0 })
    const logs = result.success && result.data ? result.data.logs : []
    const total = result.success && result.data ? result.data.total : 0
    return <AuditLogsClient initialLogs={logs} initialTotal={total} />
}
