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
        color: "text-[#1976D2]",
    },
    {
        label: "Attendance",
        icon: UserCheck,
        href: "/dashboard/attendance",
        color: "text-[#9C27B0]",
    },
    {
        label: "Courses",
        icon: GraduationCap,
        href: "/dashboard/courses",
        color: "text-[#E91E63]",
    },
    {
        label: "Students",
        icon: Users,
        href: "/dashboard/students",
        color: "text-[#FF9800]",
    },
    {
        label: "User Management",
        icon: UserCog,
        href: "/dashboard/users",
        color: "text-[#1976D2]",
        adminOnly: true,
    },
    {
        label: "Audit Logs",
        icon: Shield,
        href: "/dashboard/audit-logs",
        color: "text-[#F44336]",
        adminOnly: true,
    },
    {
        label: "Reports",
        icon: FileBarChart,
        href: "/dashboard/reports",
        color: "text-[#4CAF50]",
    },
    {
        label: "Schedule",
        icon: Calendar,
        href: "/dashboard/schedule",
        color: "text-[#009688]",
    },
    {
        label: "Departments",
        icon: Building2,
        href: "/dashboard/departments",
        color: "text-[#00BCD4]",
        adminOnly: true,
    },
    {
        label: "Rooms",
        icon: DoorOpen,
        href: "/dashboard/rooms",
        color: "text-[#795548]",
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
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#1E293B] text-white w-64 shadow-xl">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative h-10 w-10 mr-4 flex items-center justify-center bg-gradient-to-br from-[#1976D2] to-[#1565C0] rounded-lg font-bold text-white shadow-lg">
                        S
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">SAMS</h1>
                        <p className="text-[10px] text-slate-400 -mt-0.5">Smart Attendance</p>
                    </div>
                </Link>
                <div className="space-y-1">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-[#334155] rounded-lg transition-all duration-200",
                                pathname === route.href || pathname.startsWith(route.href + '/') 
                                    ? "bg-[#1976D2] text-white shadow-md" 
                                    : "text-slate-300 hover:text-white"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color, pathname === route.href || pathname.startsWith(route.href + '/') ? "text-white" : "")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2 border-t border-slate-700">
                <div className="space-y-1">
                    {bottomRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-[#334155] rounded-lg transition-all duration-200",
                                pathname === route.href ? "bg-[#1976D2] text-white shadow-md" : "text-slate-300 hover:text-white"
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
