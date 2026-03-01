import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard Overview | SAMS",
    description: "Overview of system status and quick actions",
};

async function getStats() {
    try {
        const { Client } = await import("pg");
        const client = new Client({
            connectionString: process.env.DATABASE_URL!,
            ssl: { rejectUnauthorized: false },
        });
        await client.connect();
        const [students, staff, sessions, logs] = await Promise.all([
            client.query("SELECT COUNT(*) FROM students"),
            client.query("SELECT COUNT(*) FROM users"),
            client.query("SELECT COUNT(*) FROM attendance_sessions"),
            client.query("SELECT COUNT(*) FROM audit_logs"),
        ]);
        await client.end();
        return {
            totalStudents: parseInt(students.rows[0].count),
            totalStaff: parseInt(staff.rows[0].count),
            totalSessions: parseInt(sessions.rows[0].count),
            totalAuditLogs: parseInt(logs.rows[0].count),
        };
    } catch {
        // Return defaults if DB is unavailable
        return { totalStudents: 0, totalStaff: 0, totalSessions: 0, totalAuditLogs: 0 };
    }
}

export default async function DashboardPage() {
    const { totalStudents, totalStaff, totalSessions, totalAuditLogs } = await getStats();

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Staff / Lecturers</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{totalStaff}</div>
                        <p className="text-xs text-muted-foreground">Active system accounts</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Enrolled Students</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Students in the database</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Attendance Sessions</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /></svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{totalSessions}</div>
                        <p className="text-xs text-muted-foreground">Recorded across all terms</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">FR Health Status</h3>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold text-primary">Operational</div>
                        <p className="text-xs text-muted-foreground">Engine responding normally</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4">
                    <div className="p-6">
                        <h3 className="tracking-tight text-lg font-medium mb-4">Recent Activity</h3>
                        <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                            {totalAuditLogs === 0 ? "No recent activity recorded." : "Analytics graph placeholder"}
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow col-span-3">
                    <div className="p-6">
                        <h3 className="tracking-tight text-lg font-medium mb-4">Upcoming Classes</h3>
                        <div className="space-y-6">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">CS301 - Operating Systems</p>
                                    <p className="text-sm text-muted-foreground">Starts in 30 mins</p>
                                </div>
                                <div className="ml-auto font-medium">Room 402</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">CS450 - Artificial Intelligence</p>
                                    <p className="text-sm text-muted-foreground">Starts in 2 hours</p>
                                </div>
                                <div className="ml-auto font-medium">Room 105</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
