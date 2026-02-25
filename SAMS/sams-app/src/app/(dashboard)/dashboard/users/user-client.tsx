"use client";

import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    createUser,
    updateUser,
    deleteUser
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
                // Update
                const result = await updateUser(editingUser.id, {
                    firstName,
                    lastName,
                    email,
                    role,
                });

                if (result.success && result.data) {
                    toast.success("User updated successfully");
                    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...result.data } : u));
                    setIsSheetOpen(false);
                } else {
                    toast.error(result.error || "Failed to update user");
                }
            } else {
                // Create
                const result = await createUser({
                    firstName,
                    lastName,
                    email,
                    role,
                });

                if (result.success && result.data) {
                    toast.success("User created successfully");
                    if (result.magicLink) {
                        toast.message("Setup Link Generated", {
                            description: "In production, an email would be sent. For now, copy this link:",
                            action: {
                                label: "Copy Link",
                                onClick: () => {
                                    navigator.clipboard.writeText(result.magicLink as string);
                                    toast.success("Link copied to clipboard");
                                }
                            },
                        });
                    }
                    
                    // Small delay to allow toast to render before reloading
                    setTimeout(() => {
                        window.location.reload(); 
                    }, 2500);
                    
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
        if (!confirm("Are you sure you want to delete this user?")) return;

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

    const getRoleBadge = (r: string) => {
        if (r === "SUPER_ADMIN") return <Badge variant="default" className="bg-purple-600">Super Admin</Badge>;
        if (r === "ADMIN") return <Badge variant="default" className="bg-blue-600">Admin</Badge>;
        return <Badge variant="secondary">Lecturer</Badge>;
    };

    const getStatusBadge = (s: string) => {
        if (s === "ACTIVE") return <Badge variant="default" className="bg-green-600">Active</Badge>;
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
                        <Button onClick={handleOpenNew}>
                            <Plus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-md">
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
                                    disabled={isLoading || !!editingUser} // Prevent changing email on edit for simplify
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select 
                                    id="role"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as "SUPER_ADMIN" | "ADMIN" | "LECTURER")}
                                    disabled={isLoading}
                                >
                                    <option value="LECTURER">Lecturer</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
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

            <div className="rounded-md border bg-card">
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
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleOpenEdit(user)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={user.id === currentUserId}
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
