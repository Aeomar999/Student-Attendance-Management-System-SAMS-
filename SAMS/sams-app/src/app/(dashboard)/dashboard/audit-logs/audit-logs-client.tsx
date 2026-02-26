"use client";

import { useState, useTransition } from "react";
import { Search, Shield, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getAuditLogs, type AuditLogRow } from "@/app/actions/audit";

const ACTION_COLORS: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    LOGIN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    LOGOUT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    FAILED_LOGIN: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200",
    SUSPEND: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    ACTIVATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
};

const ALL_ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "FAILED_LOGIN", "SUSPEND", "ACTIVATE"];

export function AuditLogsClient({
    initialLogs,
    initialTotal,
}: {
    initialLogs: AuditLogRow[];
    initialTotal: number;
}) {
    const [logs, setLogs] = useState<AuditLogRow[]>(initialLogs);
    const [total, setTotal] = useState(initialTotal);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [offset, setOffset] = useState(0);
    const [isPending, startTransition] = useTransition();
    const limit = 50;

    async function fetchLogs(newSearch: string, newAction: string, newOffset: number) {
        startTransition(async () => {
            const result = await getAuditLogs({
                search: newSearch,
                action: newAction || undefined,
                limit,
                offset: newOffset,
            });
            if (result.success && result.data) {
                setLogs(result.data.logs);
                setTotal(result.data.total);
            }
        });
    }

    function handleSearch(value: string) {
        setSearch(value);
        setOffset(0);
        fetchLogs(value, actionFilter, 0);
    }

    function handleActionFilter(value: string) {
        const newAction = value === "__all__" ? "" : value;
        setActionFilter(newAction);
        setOffset(0);
        fetchLogs(search, newAction, 0);
    }

    function handleRefresh() {
        fetchLogs(search, actionFilter, offset);
    }

    function handleNextPage() {
        const newOffset = offset + limit;
        setOffset(newOffset);
        fetchLogs(search, actionFilter, newOffset);
    }

    function handlePrevPage() {
        const newOffset = Math.max(0, offset - limit);
        setOffset(newOffset);
        fetchLogs(search, actionFilter, newOffset);
    }

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        Audit Logs
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Complete history of all system actions · {total.toLocaleString()} total entries
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-52">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by user or entity…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <Select onValueChange={handleActionFilter} value={actionFilter || "__all__"}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__all__">All actions</SelectItem>
                        {ALL_ACTIONS.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Actor</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    No audit logs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/50">
                                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">
                                        {log.userName || <span className="text-muted-foreground italic">System</span>}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800"}`}>
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {log.entityType && (
                                            <span>
                                                <Badge variant="outline" className="text-xs mr-1">{log.entityType}</Badge>
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {log.entityId?.slice(0, 8)}…
                                                </span>
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                        {log.details ? JSON.stringify(log.details) : "—"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {total > limit && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Page {currentPage} of {totalPages} · {total} entries</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={offset === 0 || isPending}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={offset + limit >= total || isPending}>
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
