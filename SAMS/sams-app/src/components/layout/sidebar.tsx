"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Calendar,
    Settings,
    UserCheck,
    FileBarChart,
    UserCog,
    Shield,
    LucideIcon,
    Building2,
    DoorOpen,
} from "lucide-react";

type Route = {
    label: string;
    icon: LucideIcon;
    href: string;
    color?: string;
    adminOnly?: boolean;
};

const routes: Route[] = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Attendance",
        icon: UserCheck,
        href: "/dashboard/attendance",
        color: "text-violet-500",
    },
    {
        label: "Courses",
        icon: GraduationCap,
        href: "/dashboard/courses",
        color: "text-pink-700",
    },
    {
        label: "Students",
        icon: Users,
        href: "/dashboard/students",
        color: "text-orange-700",
    },
    {
        label: "User Management",
        icon: UserCog,
        href: "/dashboard/users",
        color: "text-indigo-500",
        adminOnly: true,
    },
    {
        label: "Audit Logs",
        icon: Shield,
        href: "/dashboard/audit-logs",
        color: "text-amber-500",
        adminOnly: true,
    },
    {
        label: "Reports",
        icon: FileBarChart,
        href: "/dashboard/reports",
        color: "text-emerald-500",
    },
    {
        label: "Schedule",
        icon: Calendar,
        href: "/dashboard/schedule",
        color: "text-green-700",
    },
    {
        label: "Departments",
        icon: Building2,
        href: "/dashboard/departments",
        color: "text-cyan-500",
        adminOnly: true,
    },
    {
        label: "Rooms",
        icon: DoorOpen,
        href: "/dashboard/rooms",
        color: "text-teal-500",
        adminOnly: true,
    },
];

const bottomRoutes = [
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role;

    const filteredRoutes = routes.filter(route => {
        if (route.adminOnly) {
            return role === "ADMIN" || role === "SUPER_ADMIN";
        }
        return true;
    });

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white w-64">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative h-8 w-8 mr-4 flex items-center justify-center bg-primary rounded-full font-bold">
                        S
                    </div>
                    <h1 className="text-2xl font-bold">
                        SAMS
                    </h1>
                </Link>
                <div className="space-y-1">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href || pathname.startsWith(route.href + '/') ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div className="space-y-1">
                    {bottomRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className="h-5 w-5 mr-3" />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
