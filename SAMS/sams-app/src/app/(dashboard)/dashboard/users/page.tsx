import { Metadata } from "next";
import { getUsers } from "@/app/actions/user";
import { UserClient } from "./user-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "User Management | SAMS",
    description: "Manage system administrators and lecturers",
};

export default async function UsersPage() {
    const session = await auth();
    const role = session?.user?.role;

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        redirect("/dashboard");
    }

    const { data: users, success } = await getUsers();

    if (!success) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                <div className="text-red-500">Failed to load users.</div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <UserClient initialUsers={users || []} currentUserId={session?.user?.id || ""} />
        </div>
    );
}
