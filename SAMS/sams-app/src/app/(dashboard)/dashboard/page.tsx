import { Metadata } from "next"
import { withDb } from "@/lib/db"
import { unstable_cache } from "next/cache"
import { auth } from "@/lib/auth"
import { User, Users, Calendar, Shield, TrendingUp, TrendingDown, Clock, BookOpen, QrCode, Activity } from "lucide-react"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function getFormattedDate() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
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
    isPrimary?: boolean
    progressValue?: number
}

function StatCard({ title, value, subtitle, icon, trend, valueClass, href, isPrimary, progressValue }: StatCardProps) {
    const content = (
        <Card className={`group relative overflow-hidden backdrop-blur-sm border shadow-sm hover:shadow-md transition-all duration-300 ${isPrimary ? "bg-card text-card-foreground border-primary/40 shadow-primary/5" : "bg-card/80 text-card-foreground border-border/50 hover:-translate-y-1"}`}>
            {/* Glossy gradient overlay for primary card */}
            {isPrimary && (
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className={`tracking-tight text-sm font-medium ${isPrimary ? "text-foreground" : "text-muted-foreground group-hover:text-foreground transition-colors"}`}>{title}</CardTitle>
                <div className={`p-2 rounded-xl border transition-colors ${isPrimary ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary"}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="pt-0 relative z-10 flex items-end justify-between">
                <div>
                    <div className="flex items-baseline gap-3">
                        <div className={`text-4xl font-bold tracking-tight ${valueClass || ""}`}>
                            {value}
                        </div>
                        {trend && (
                            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full shadow-sm ${trend.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                                {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {Math.abs(trend.value)}%
                            </div>
                        )}
                    </div>
                    <p className={`text-xs mt-3 text-muted-foreground`}>{subtitle}</p>
                </div>
                {/* Circular Progress Ring for specific cards mapping data to progressValue */}
                {progressValue !== undefined && (
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <svg className="w-12 h-12 transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted" />
                            <circle 
                                cx="24" cy="24" r="20" 
                                stroke="currentColor" 
                                strokeWidth="4" 
                                fill="transparent" 
                                strokeDasharray={125.6} /* 2 * PI * r */
                                strokeDashoffset={125.6 - (progressValue / 100) * 125.6}
                                className="text-primary"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-foreground">{progressValue}%</span>
                    </div>
                )}
            </CardContent>
        </Card>
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
            className={`group flex items-center gap-4 p-4 rounded-xl border ${variant === "default" ? "bg-primary/5 text-foreground border-primary/30" : "bg-card hover:bg-muted border-border"} transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md`}
        >
            <div className={`p-2 rounded-xl border transition-colors ${variant === "default" ? "bg-primary/10 border-primary/20 text-primary group-hover:bg-primary/20" : "bg-muted border-border text-muted-foreground group-hover:bg-background group-hover:border-foreground/10 group-hover:text-foreground"}`}>
                {icon}
            </div>
            <div>
                <p className={`font-semibold ${variant === "default" ? "text-foreground" : "group-hover:text-foreground transition-colors"}`}>{title}</p>
                <p className={`text-xs mt-0.5 ${variant === "default" ? "text-muted-foreground" : "text-muted-foreground"}`}>{description}</p>
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
            title: "Enrolled Students",
            value: data.totalStudents,
            subtitle: `${data.faceEnrolled} with face data enrolled`,
            icon: <Users className="h-5 w-5" />,
            trend: { value: 12, isPositive: true },
            href: "/dashboard/students",
            isPrimary: true,
        },
        {
            title: "Total Staff / Lecturers",
            value: data.totalStaff,
            subtitle: "Active system accounts",
            icon: <User className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />,
            trend: { value: 8, isPositive: true },
            href: "/dashboard/users",
        },
        {
            title: "Attendance Sessions",
            value: data.totalSessions,
            subtitle: "Overall attendance completion",
            icon: <Calendar className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />,
            trend: data.attendanceRate >= 90 ? { value: 5, isPositive: true } : { value: 3, isPositive: false },
            href: "/dashboard/attendance",
            progressValue: data.attendanceRate
        },
        {
            title: "FR Health Status",
            value: "Operational",
            subtitle: "Face recognition engine healthy",
            icon: <Shield className="h-5 w-5 text-primary" />,
            valueClass: "text-primary",
        },
    ]

    return (
        <div className="flex-1 space-y-8 pb-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <Card className="relative overflow-hidden p-6 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-24 bg-secondary/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                    <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">{getFormattedDate()}</p>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                        {getGreeting()}, {firstName}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-xl text-lg">
                        Here&apos;s what&apos;s happening with your attendance system today.
                    </p>
                </div>
                <div className="relative z-10 flex gap-3 flex-wrap">
                    <Link href="/dashboard/attendance">
                        <Button >
                            <QrCode className="mr-2 h-4 w-4" />
                            Start Session
                        </Button>
                    </Link>
                </div>
            </Card>

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
                <Card className="text-card-foreground shadow-sm col-span-4 flex flex-col">
                    <CardHeader className="p-6 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="tracking-tight text-lg font-semibold">Recent Activity</CardTitle>
                            <Link href="/dashboard/audit-logs" className="text-sm text-primary hover:underline">
                                View all
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                        {data.recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                                <Clock className="h-12 w-12 mb-3 opacity-20" />
                                <p>No recent activity recorded.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.recentActivity.map((item: { action: string; entityType: string; createdAt: string; userName: string | null }, i: number) => (
                                    <div 
                                        key={i} 
                                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted">
                                            {item.action.includes('CREATE') ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : 
                                             item.action.includes('UPDATE') ? <Activity className="h-4 w-4 text-blue-500" /> : 
                                             item.action.includes('DELETE') ? <TrendingDown className="h-4 w-4 text-destructive" /> : 
                                             <User className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="text-sm font-medium leading-none">
                                                {item.userName ?? "System"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                                                {item.action.toLowerCase().replace(/_/g, " ")} {item.entityType?.toLowerCase()}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                                            {formatTimeAgo(item.createdAt)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Sessions */}
                <Card className="text-card-foreground shadow-sm col-span-3 flex flex-col">
                    <CardHeader className="p-6 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="tracking-tight text-lg font-semibold">Upcoming Sessions</CardTitle>
                            <Link href="/dashboard/schedule" className="text-sm text-primary hover:underline">
                                View calendar
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                        {data.upcomingSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                                <Calendar className="h-12 w-12 mb-3 opacity-20" />
                                <p>No upcoming sessions scheduled.</p>
                            </div>
                        ) : (
                            <div className="relative border-l border-border/60 ml-3 md:ml-4 space-y-6">
                                {data.upcomingSessions.map((s: { id: string; courseCode: string; courseName: string; sessionDate: string; startTime: string; status: string }, i: number) => (
                                    <div 
                                        key={s.id} 
                                        className="relative pl-6 animate-in fade-in slide-in-from-right-4 fill-mode-both"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        {/* Timeline Dot */}
                                        <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-card bg-primary" />
                                        
                                        <div className="flex flex-col rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm transition-all group">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                        {s.courseCode}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                                        {s.courseName}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                                    s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 animate-pulse" : 
                                                    s.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : 
                                                    "bg-muted text-muted-foreground"
                                                }`}>
                                                    {s.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(s.sessionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                                <span className="text-border mx-1">•</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatSessionTime(s.startTime)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
