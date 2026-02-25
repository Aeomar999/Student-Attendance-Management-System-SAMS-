import { Metadata } from "next";
import { Calendar, Clock, MapPin } from "lucide-react";

export const metadata: Metadata = {
    title: "Schedule | SAMS",
    description: "View and manage class schedules",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function SchedulePage() {
    return (
        <div className="flex-1 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
                <p className="text-muted-foreground">View your weekly class schedule and upcoming sessions.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-700/10 rounded-lg">
                            <Calendar className="h-5 w-5 text-green-700" />
                        </div>
                        <h3 className="font-semibold">This Week</h3>
                    </div>
                    <div className="space-y-2">
                        {DAYS.map(day => (
                            <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                                <span className="text-sm font-medium">{day}</span>
                                <span className="text-sm text-muted-foreground">No classes scheduled</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-sky-500/10 rounded-lg">
                            <Clock className="h-5 w-5 text-sky-500" />
                        </div>
                        <h3 className="font-semibold">Upcoming Sessions</h3>
                    </div>
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                        <MapPin className="h-8 w-8 opacity-30" />
                        <p className="text-sm">No upcoming sessions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
