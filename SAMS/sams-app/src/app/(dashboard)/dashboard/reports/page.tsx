import { Metadata } from "next";
import { BarChart3, Download, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "Reports | SAMS",
    description: "Attendance analytics and exportable reports",
};

export default function ReportsPage() {
    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                    <p className="text-muted-foreground">Attendance analytics and exportable reports.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                    <Download className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h3 className="font-semibold">Overall Attendance</h3>
                    </div>
                    <p className="text-3xl font-bold">—%</p>
                    <p className="text-sm text-muted-foreground mt-1">Average across all courses</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Sessions This Month</h3>
                    </div>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Total sessions recorded</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />
                        </div>
                        <h3 className="font-semibold">At-Risk Students</h3>
                    </div>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Below 75% attendance</p>
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Attendance Trends</h3>
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                        <BarChart3 className="h-10 w-10 opacity-30" />
                        <p>No data available yet.</p>
                        <p className="text-sm">Charts will appear once attendance sessions are recorded.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
