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
    Target,
} from "lucide-react";

type Route = {
    label: string;
    icon: LucideIcon;
    href: string;
    adminOnly?: boolean;
};

const routes: Route[] = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        label: "Attendance",
        icon: UserCheck,
        href: "/dashboard/attendance",
    },
    {
        label: "Courses",
        icon: GraduationCap,
        href: "/dashboard/courses",
    },
    {
        label: "Students",
        icon: Users,
        href: "/dashboard/students",
    },
    {
        label: "User Management",
        icon: UserCog,
        href: "/dashboard/users",
        adminOnly: true,
    },
    {
        label: "Audit Logs",
        icon: Shield,
        href: "/dashboard/audit-logs",
        adminOnly: true,
    },
    {
        label: "Reports",
        icon: FileBarChart,
        href: "/dashboard/reports",
    },
    {
        label: "Schedule",
        icon: Calendar,
        href: "/dashboard/schedule",
    },
    {
        label: "Departments",
        icon: Building2,
        href: "/dashboard/departments",
        adminOnly: true,
    },
    {
        label: "Rooms",
        icon: DoorOpen,
        href: "/dashboard/rooms",
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

export function Sidebar({ className }: { className?: string }) {
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
        <div className={cn("space-y-4 py-4 flex flex-col h-full bg-background text-foreground w-64 border-r border-border relative z-20", className)}>
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-8">
                    <div className="relative h-10 w-10 mr-4 flex items-center justify-center bg-primary rounded-lg text-primary-foreground shadow-sm">
                        <Target className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">SAMS</h1>
                        <p className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-wider font-semibold">Smart Attendance</p>
                    </div>
                </Link>
                <div className="space-y-1">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-2.5 w-full justify-start font-medium cursor-pointer rounded-lg transition-colors",
                                (route.href === "/dashboard" ? pathname === "/dashboard" : (pathname === route.href || pathname.startsWith(route.href + '/')))
                                    ? "bg-muted text-foreground" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-4 w-4 mr-3", (route.href === "/dashboard" ? pathname === "/dashboard" : (pathname === route.href || pathname.startsWith(route.href + '/'))) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2 mt-auto">
                <div className="space-y-1">
                    {bottomRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-2.5 w-full justify-start font-medium cursor-pointer rounded-lg transition-colors",
                                pathname === route.href ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-4 w-4 mr-3", pathname === route.href ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
