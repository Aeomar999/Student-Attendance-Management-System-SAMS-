"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldOff, ShieldCheck } from "lucide-react";
import { suspendUser, activateUser } from "@/actions/users";
import { toast } from "sonner";
import { format } from "date-fns";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    mfaEnabled: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
}

interface UserTableProps {
    users: User[];
}

const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive"> = {
    SUPER_ADMIN: "destructive",
    ADMIN: "default",
    LECTURER: "secondary",
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive"> = {
    ACTIVE: "default",
    INACTIVE: "secondary",
    SUSPENDED: "destructive",
};

export function UserTable({ users }: UserTableProps) {
    const [isPending, startTransition] = useTransition();

    function handleSuspend(userId: string) {
        startTransition(async () => {
            const result = await suspendUser(userId);
            if (result.success) {
                toast.success("User suspended");
            } else {
                toast.error("Failed to suspend user");
            }
        });
    }

    function handleActivate(userId: string) {
        startTransition(async () => {
            const result = await activateUser(userId);
            if (result.success) {
                toast.success("User activated");
            } else {
                toast.error("Failed to activate user");
            }
        });
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-muted-foreground text-sm">No users found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>MFA</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={ROLE_COLORS[user.role] ?? "secondary"}>
                                    {user.role.replace("_", " ")}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={STATUS_COLORS[user.status] ?? "secondary"}>
                                    {user.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className={user.mfaEnabled ? "text-primary" : "text-muted-foreground"}>
                                    {user.mfaEnabled ? "Enabled" : "Disabled"}
                                </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, yyyy") : "Never"}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled={isPending}>
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {user.status === "ACTIVE" ? (
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleSuspend(user.id)}
                                            >
                                                <ShieldOff className="mr-2 h-4 w-4" />
                                                Suspend
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                Activate
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
