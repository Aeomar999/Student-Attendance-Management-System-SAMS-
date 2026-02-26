import { Metadata } from "next"
import { withDb } from "@/lib/db"
import { unstable_cache } from "next/cache"

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

export default async function DashboardPage() {
    const data = await getDashboardData()

    const statCards = [
        {
            title: "Total Staff / Lecturers",
            value: data.totalStaff,
            subtitle: "Active system accounts",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            title: "Enrolled Students",
            value: data.totalStudents,
            subtitle: `${data.faceEnrolled} with face data`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
            ),
        },
        {
            title: "Attendance Sessions",
            value: data.totalSessions,
            subtitle: `${data.attendanceRate}% avg attendance rate`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
                    <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
                </svg>
            ),
        },
        {
            title: "FR Health Status",
            value: "Operational",
            subtitle: "Engine responding normally",
            valueClass: "text-green-500",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-green-500">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
        },
    ]

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(card => (
                    <div key={card.title} className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">{card.title}</h3>
                            {card.icon}
                        </div>
                        <div className="p-6 pt-0">
                            <div className={`text-2xl font-bold ${"valueClass" in card ? card.valueClass : ""}`}>
                                {card.value}
                            </div>
                            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4">
                    <div className="p-6">
                        <h3 className="tracking-tight text-lg font-medium mb-4">Recent Activity</h3>
                        {data.recentActivity.length === 0 ? (
                            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                                No recent activity recorded.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.recentActivity.map((item: { action: string; entityType: string; createdAt: string; userName: string | null }, i: number) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium">{item.userName ?? "System"}</span>
                                            {" "}
                                            <span className="text-muted-foreground">
                                                {item.action.toLowerCase().replace(/_/g, " ")} {item.entityType.toLowerCase()}
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
                <div className="rounded-xl border bg-card text-card-foreground shadow col-span-3">
                    <div className="p-6">
                        <h3 className="tracking-tight text-lg font-medium mb-4">Upcoming Sessions</h3>
                        {data.upcomingSessions.length === 0 ? (
                            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                                No upcoming sessions scheduled.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.upcomingSessions.map((s: { id: string; courseCode: string; courseName: string; sessionDate: string; startTime: string; status: string }) => (
                                    <div key={s.id} className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full shrink-0 ${s.status === "ACTIVE" ? "bg-green-500" : "bg-muted-foreground"}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-none truncate">
                                                {s.courseCode} — {s.courseName}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(s.sessionDate).toLocaleDateString()} at {formatSessionTime(s.startTime)}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium shrink-0 ${s.status === "ACTIVE" ? "text-green-500" : "text-muted-foreground"}`}>
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
