import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "LECTURER"

export const ROLE_HIERARCHY: Record<UserRole, number> = {
    SUPER_ADMIN: 3,
    ADMIN: 2,
    LECTURER: 1,
}

export async function checkRole(requiredRoles: UserRole[]): Promise<boolean> {
    const session = await auth()
    if (!session?.user?.role) return false

    const userRole = session.user.role as UserRole
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0

    return requiredRoles.some(role => userLevel >= ROLE_HIERARCHY[role])
}

export async function requireRole(...requiredRoles: UserRole[]) {
    const session = await auth()
    if (!session?.user) {
        redirect("/login")
    }

    const userRole = session.user.role as UserRole
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0

    const hasAccess = requiredRoles.some(role => userLevel >= ROLE_HIERARCHY[role])

    if (!hasAccess) {
        redirect("/dashboard?error=unauthorized")
    }

    return session
}

export async function requireAdmin() {
    return requireRole("ADMIN", "SUPER_ADMIN")
}

export async function requireSuperAdmin() {
    return requireRole("SUPER_ADMIN")
}

export async function requireLecturer() {
    return requireRole("LECTURER", "ADMIN", "SUPER_ADMIN")
}

export function canManageUser(targetRole: UserRole): boolean {
    const session = auth()
    if (!session) return false

    return true
}

export const PERMISSIONS = {
    user: {
        create: ["ADMIN", "SUPER_ADMIN"],
        read: ["LECTURER", "ADMIN", "SUPER_ADMIN"],
        update: ["ADMIN", "SUPER_ADMIN"],
        delete: ["SUPER_ADMIN"],
    },
    student: {
        create: ["ADMIN", "SUPER_ADMIN"],
        read: ["LECTURER", "ADMIN", "SUPER_ADMIN"],
        update: ["ADMIN", "SUPER_ADMIN"],
        delete: ["ADMIN", "SUPER_ADMIN"],
    },
    course: {
        create: ["ADMIN", "SUPER_ADMIN"],
        read: ["LECTURER", "ADMIN", "SUPER_ADMIN"],
        update: ["ADMIN", "SUPER_ADMIN"],
        delete: ["SUPER_ADMIN"],
    },
    attendance: {
        create: ["LECTURER", "ADMIN", "SUPER_ADMIN"],
        read: ["LECTURER", "ADMIN", "SUPER_ADMIN"],
        update: ["LECTURER", "ADMIN", "SUPER_ADMIN"],
        delete: ["ADMIN", "SUPER_ADMIN"],
    },
    reports: {
        read: ["LECTURER", "ADMIN", "SUPER_ADMIN"],
        export: ["LECTURER", "ADMIN", "SUPER_ADMIN"],
    },
    audit: {
        read: ["ADMIN", "SUPER_ADMIN"],
    },
    settings: {
        read: ["ADMIN", "SUPER_ADMIN"],
        update: ["SUPER_ADMIN"],
    },
} as const

export async function hasPermission(
    resource: keyof typeof PERMISSIONS,
    action: string
): Promise<boolean> {
    const session = await auth()
    if (!session?.user?.role) return false

    const userRole = session.user.role as UserRole
    const allowedRoles = PERMISSIONS[resource][action as keyof typeof PERMISSIONS[typeof resource]] as unknown as UserRole[]

    return allowedRoles.includes(userRole)
}
