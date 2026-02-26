import { Metadata } from "next"
import { withDb } from "@/lib/db"
import { unstable_cache } from "next/cache"
import { auth } from "@/lib/auth"
import { User, Users, Calendar, Shield, TrendingUp, TrendingDown, Clock, BookOpen, QrCode, Activity } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Dashboard Overview | SAMS",
    description: "Overview of system status and quick actions",
}

export const dynamic = "force-dynamic"

const getCachedStats = unstable_cache(
    async () => {
        return withDb(async (db) => {
            const result = await db.query(`
                SELECT 
                    (SELECT COUNT(*) FROM students WHERE status='ACTIVE') as "totalStudents",
                    (SELECT COUNT(*) FROM users WHERE status='ACTIVE') as "totalStaff",
                    (SELECT COUNT(*) FROM attendance_sessions) as "totalSessions",
                    (SELECT COUNT(*) FROM audit_logs) as "totalAuditLogs",
                    (SELECT COUNT(*) FROM students WHERE face_enrolled=true) as "faceEnrolled",
                    (SELECT COUNT(*) FROM attendance_records WHERE status='PRESENT') as "presentRecords",
                    (SELECT COUNT(*) FROM attendance_records) as "totalRecords"
            `)
            const row = result.rows[0]
            const totalRec = parseInt(row.totalRecords)
            const presentRec = parseInt(row.presentRecords)
            return {
                totalStudents: parseInt(row.totalStudents),
                totalStaff: parseInt(row.totalStaff),
                totalSessions: parseInt(row.totalSessions),
                totalAuditLogs: parseInt(row.totalAuditLogs),
                faceEnrolled: parseInt(row.faceEnrolled),
                attendanceRate: totalRec > 0 ? Math.round(presentRec / totalRec * 100) : 0,
            }
        })
    },
    ["dashboard-stats"],
    { revalidate: 60 }
)

const getCachedUpcomingSessions = unstable_cache(
    async () => {
        return withDb(async (db) => {
            const result = await db.query(`
                SELECT 
                    s.id, c.code AS "courseCode", c.name AS "courseName",
                    s.session_date AS "sessionDate",
                    s.start_time AS "startTime", s.status
                FROM attendance_sessions s
                LEFT JOIN courses c ON s.course_id = c.id::text
                WHERE s.session_date >= CURRENT_DATE
                ORDER BY s.session_date ASC, s.start_time ASC
                LIMIT 5
            `)
            return result.rows
        })
    },
    ["upcoming-sessions"],
    { revalidate: 60 }
)

const getCachedRecentActivity = unstable_cache(
    async () => {
        return withDb(async (db) => {
            const result = await db.query(`
                SELECT al.action, al.entity_type AS "entityType", al.created_at AS "createdAt",
                    CONCAT(u.first_name, ' ', u.last_name) AS "userName"
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                ORDER BY al.created_at DESC
                LIMIT 6
            `)
            return result.rows
        })
    },
    ["recent-activity"],
    { revalidate: 30 }
)

async function getDashboardData() {
    try {
        const [stats, upcomingSessions, recentActivity] = await Promise.all([
            getCachedStats(),
            getCachedUpcomingSessions(),
            getCachedRecentActivity(),
        ])
        return {
            ...stats,
            upcomingSessions,
            recentActivity,
        }
    } catch {
        return {
            totalStudents: 0, totalStaff: 0, totalSessions: 0, totalAuditLogs: 0,
            faceEnrolled: 0, attendanceRate: 0, upcomingSessions: [], recentActivity: [],
        }
    }
}

function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

function formatSessionTime(startTime: string) {
    try {
        return new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
        return "—"
    }
}

interface StatCardProps {
    title: string
    value: string | number
    subtitle: string
    icon: React.ReactNode
    trend?: { value: number; isPositive: boolean }
    valueClass?: string
    href?: string
}

function StatCard({ title, value, subtitle, icon, trend, valueClass, href }: StatCardProps) {
    const content = (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
                <div className="p-2 rounded-lg bg-primary/10">
                    {icon}
                </div>
            </div>
            <div className="p-6 pt-0">
                <div className="flex items-baseline gap-2">
                    <div className={`text-3xl font-bold ${valueClass || ""}`}>
                        {value}
                    </div>
                    {trend && (
                        <div className={`flex items-center text-xs font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                            {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {Math.abs(trend.value)}%
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </div>
        </div>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }
    return content
}

interface QuickActionProps {
    title: string
    description: string
    icon: React.ReactNode
    href: string
    variant?: "default" | "outline"
}

function QuickAction({ title, description, icon, href, variant = "outline" }: QuickActionProps) {
    return (
        <Link 
            href={href} 
            className={`flex items-center gap-4 p-4 rounded-lg border ${variant === "default" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"} transition-colors`}
        >
            <div className={`p-2 rounded-lg ${variant === "default" ? "bg-primary/20" : "bg-primary/10"}`}>
                {icon}
            </div>
            <div>
                <p className={`font-medium ${variant === "default" ? "text-primary-foreground" : ""}`}>{title}</p>
                <p className={`text-xs ${variant === "default" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{description}</p>
            </div>
        </Link>
    )
}

export default async function DashboardPage() {
    const session = await auth()
    const data = await getDashboardData()
    
    const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "User"
    const firstName = userName.split(' ')[0]

    const statCards = [
        {
            title: "Total Staff / Lecturers",
            value: data.totalStaff,
            subtitle: "Active system accounts",
            icon: <User className="h-5 w-5 text-primary" />,
            trend: { value: 8, isPositive: true },
            href: "/dashboard/users",
        },
        {
            title: "Enrolled Students",
            value: data.totalStudents,
            subtitle: `${data.faceEnrolled} with face data enrolled`,
            icon: <Users className="h-5 w-5 text-primary" />,
            trend: { value: 12, isPositive: true },
            href: "/dashboard/students",
        },
        {
            title: "Attendance Sessions",
            value: data.totalSessions,
            subtitle: `${data.attendanceRate}% avg attendance rate`,
            icon: <Calendar className="h-5 w-5 text-primary" />,
            trend: data.attendanceRate >= 90 ? { value: 5, isPositive: true } : { value: 3, isPositive: false },
            href: "/dashboard/attendance",
        },
        {
            title: "FR Health Status",
            value: "Operational",
            subtitle: "Face recognition engine healthy",
            icon: <Shield className="h-5 w-5 text-green-500" />,
            valueClass: "text-green-500",
        },
    ]

    return (
        <div className="flex-1 space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back, {firstName}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here&apos;s what&apos;s happening with your attendance system today.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/attendance">
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <QrCode className="mr-2 h-4 w-4" />
                            Start Session
                        </button>
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <QuickAction
                    title="Take Attendance"
                    description="Start a new session"
                    icon={<QrCode className="h-5 w-5 text-primary" />}
                    href="/dashboard/attendance"
                />
                <QuickAction
                    title="View Reports"
                    description="Analytics & insights"
                    icon={<Activity className="h-5 w-5 text-primary" />}
                    href="/dashboard/reports"
                />
                <QuickAction
                    title="Manage Students"
                    description="Add or edit students"
                    icon={<Users className="h-5 w-5 text-primary" />}
                    href="/dashboard/students"
                />
                <QuickAction
                    title="View Schedule"
                    description="Session calendar"
                    icon={<BookOpen className="h-5 w-5 text-primary" />}
                    href="/dashboard/schedule"
                />
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(card => (
                    <StatCard key={card.title} {...card} />
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-4">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="tracking-tight text-lg font-semibold">Recent Activity</h3>
                            <Link href="/dashboard/audit-logs" className="text-sm text-primary hover:underline">
                                View all
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {data.recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm">
                                <Clock className="h-12 w-12 mb-3 opacity-20" />
                                <p>No recent activity recorded.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.recentActivity.map((item: { action: string; entityType: string; createdAt: string; userName: string | null }, i: number) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium">{item.userName ?? "System"}</span>
                                            {" "}
                                            <span className="text-muted-foreground">
                                                {item.action.toLowerCase().replace(/_/g, " ")} {item.entityType?.toLowerCase()}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {formatTimeAgo(item.createdAt)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Sessions */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-3">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="tracking-tight text-lg font-semibold">Upcoming Sessions</h3>
                            <Link href="/dashboard/schedule" className="text-sm text-primary hover:underline">
                                View calendar
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {data.upcomingSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm">
                                <Calendar className="h-12 w-12 mb-3 opacity-20" />
                                <p>No upcoming sessions scheduled.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.upcomingSessions.map((s: { id: string; courseCode: string; courseName: string; sessionDate: string; startTime: string; status: string }) => (
                                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className={`h-3 w-3 rounded-full shrink-0 ${s.status === "ACTIVE" ? "bg-green-500 animate-pulse" : s.status === "COMPLETED" ? "bg-blue-500" : "bg-muted-foreground"}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-none truncate">
                                                {s.courseCode}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1.5 truncate">
                                                {s.courseName}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(s.sessionDate).toLocaleDateString()} · {formatSessionTime(s.startTime)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            s.status === "ACTIVE" ? "bg-green-100 text-green-700" : 
                                            s.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : 
                                            "bg-muted text-muted-foreground"
                                        }`}>
                                            {s.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
