"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, Ban, CheckCircle, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    createUser, updateUser, deleteUser, suspendUser, activateUser, adminSendPasswordReset
} from "@/app/actions/user";

type UserType = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: Date;
};

export function UserClient({
    initialUsers,
    currentUserId
}: {
    initialUsers: UserType[];
    currentUserId: string;
}) {
    const [users, setUsers] = useState<UserType[]>(initialUsers);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"SUPER_ADMIN" | "ADMIN" | "LECTURER">("LECTURER");

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setRole("LECTURER");
        setEditingUser(null);
    };

    const handleOpenEdit = (user: UserType) => {
        setEditingUser(user);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setRole(user.role as "SUPER_ADMIN" | "ADMIN" | "LECTURER");
        setIsSheetOpen(true);
    };

    const handleOpenNew = () => {
        resetForm();
        setIsSheetOpen(true);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingUser) {
                const result = await updateUser(editingUser.id, { firstName, lastName, email, role });
                if (result.success) {
                    toast.success("User updated successfully");
                    setUsers(users.map(u => u.id === editingUser.id ? { ...u, firstName, lastName, email, role } : u));
                    setIsSheetOpen(false);
                } else {
                    toast.error(result.error || "Failed to update user");
                }
            } else {
                const result = await createUser({ firstName, lastName, email, role });
                if (result.success && "data" in result && result.data) {
                    toast.success("User created successfully");
                    if ("magicLink" in result && result.magicLink) {
                        toast.message("Setup Link Generated", {
                            description: "In production an email would be sent. Copy this setup link:",
                            action: {
                                label: "Copy Link",
                                onClick: () => {
                                    navigator.clipboard.writeText(result.magicLink as string);
                                    toast.success("Link copied to clipboard");
                                }
                            },
                        });
                    }
                    setTimeout(() => window.location.reload(), 2500);
                    setIsSheetOpen(false);
                } else {
                    toast.error(result.error || "Failed to create user");
                }
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        setIsLoading(true);
        try {
            const result = await deleteUser(id);
            if (result.success) {
                toast.success("User deleted successfully");
                setUsers(users.filter(u => u.id !== id));
            } else {
                toast.error(result.error || "Failed to delete user");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuspend = async (id: string) => {
        if (!confirm("Suspend this user? They will be unable to login until reactivated.")) return;
        try {
            const result = await suspendUser(id);
            if (result.success) {
                toast.success("User suspended");
                setUsers(users.map(u => u.id === id ? { ...u, status: "SUSPENDED" } : u));
            } else {
                toast.error(result.error || "Failed to suspend user");
            }
        } catch {
            toast.error("An unexpected error occurred");
        }
    };

    const handleActivate = async (id: string) => {
        try {
            const result = await activateUser(id);
            if (result.success) {
                toast.success("User activated");
                setUsers(users.map(u => u.id === id ? { ...u, status: "ACTIVE" } : u));
            } else {
                toast.error(result.error || "Failed to activate user");
            }
        } catch {
            toast.error("An unexpected error occurred");
        }
    };

    const handlePasswordReset = async (id: string) => {
        try {
            const result = await adminSendPasswordReset(id);
            if (result.success && "data" in result && result.data) {
                const link = (result.data as { resetLink: string }).resetLink;
                navigator.clipboard.writeText(link).then(() => {
                    toast.success("Password reset link copied to clipboard", {
                        description: "Share this link with the user to let them set a new password.",
                    });
                }).catch(() => {
                    toast.message("Password Reset Link", { description: link });
                });
            } else {
                toast.error(result.error || "Failed to generate reset link");
            }
        } catch {
            toast.error("An unexpected error occurred");
        }
    };

    const getRoleBadge = (r: string) => {
        if (r === "SUPER_ADMIN") return <Badge variant="default" className="bg-purple-600">Super Admin</Badge>;
        if (r === "ADMIN") return <Badge variant="default" className="bg-blue-600">Admin</Badge>;
        return <Badge variant="secondary">Lecturer</Badge>;
    };

    const getStatusBadge = (s: string) => {
        if (s === "ACTIVE") return <Badge variant="default" className="bg-primary">Active</Badge>;
        if (s === "SUSPENDED") return <Badge variant="destructive">Suspended</Badge>;
        return <Badge variant="secondary">Inactive</Badge>;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">
                        Manage system administrators, lecturers, and staff accounts.
                    </p>
                </div>

                <Sheet open={isSheetOpen} onOpenChange={(open) => {
                    setIsSheetOpen(open);
                    if (!open) resetForm();
                }}>
                    <SheetTrigger asChild>
                        <Button onClick={handleOpenNew} >
                            <Plus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{editingUser ? "Edit User" : "Add New User"}</SheetTitle>
                            <SheetDescription>
                                {editingUser ? "Update the details for this user." : "Fill in the details to create a new user account."}
                            </SheetDescription>
                        </SheetHeader>

                        <form onSubmit={onSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading || !!editingUser}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={role} onValueChange={(val) => setRole(val as "SUPER_ADMIN" | "ADMIN" | "LECTURER")} disabled={isLoading}>
                                    <SelectTrigger id="role" className="w-full h-10">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LECTURER">Lecturer</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : editingUser ? "Update User" : "Create User"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="overflow-hidden shadow-sm mt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Added Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.firstName} {user.lastName}</span>
                                            <span className="text-sm text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                                    <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(user)}
                                                title="Edit user"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handlePasswordReset(user.id)}
                                                title="Copy password reset link"
                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                            {user.status === "SUSPENDED" ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleActivate(user.id)}
                                                    className="text-primary hover:text-primary hover:bg-primary/10"
                                                    title="Activate user"
                                                    disabled={user.id === currentUserId}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleSuspend(user.id)}
                                                    className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                                                    title="Suspend user"
                                                    disabled={user.id === currentUserId}
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={user.id === currentUserId || isLoading}
                                                title="Delete user"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
