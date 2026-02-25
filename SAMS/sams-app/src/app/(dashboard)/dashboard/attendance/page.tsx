import { Metadata } from "next";
import { CalendarCheck, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
    title: "Attendance | SAMS",
    description: "View and manage attendance sessions",
};

export default function AttendancePage() {
    return (
        <div className="flex-1 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
                <p className="text-muted-foreground">View and manage attendance sessions across all courses.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CalendarCheck className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Today&apos;s Sessions</h3>
                    </div>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Active sessions today</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-violet-500/10 rounded-lg">
                            <Users className="h-5 w-5 text-violet-500" />
                        </div>
                        <h3 className="font-semibold">Present Today</h3>
                    </div>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Students marked present</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Clock className="h-5 w-5 text-orange-500" />
                        </div>
                        <h3 className="font-semibold">Upcoming</h3>
                    </div>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Sessions in next 2 hours</p>
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Recent Attendance Sessions</h3>
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                        <CalendarCheck className="h-10 w-10 opacity-30" />
                        <p>No attendance sessions recorded yet.</p>
                        <p className="text-sm">Sessions will appear here once lecturers start classes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
