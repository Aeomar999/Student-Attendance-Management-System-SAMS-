import { Metadata } from "next";
import { Bell, Lock, Palette, Shield, User } from "lucide-react";

export const metadata: Metadata = {
    title: "Settings | SAMS",
    description: "Account and system settings",
};

const sections = [
    { icon: User, label: "Profile", description: "Update your name, email, and avatar", color: "text-sky-500", bg: "bg-sky-500/10" },
    { icon: Lock, label: "Security", description: "Change password and configure MFA", color: "text-violet-500", bg: "bg-violet-500/10" },
    { icon: Bell, label: "Notifications", description: "Manage email and in-app notifications", color: "text-orange-500", bg: "bg-orange-500/10" },
    { icon: Palette, label: "Appearance", description: "Customize the dashboard theme", color: "text-pink-500", bg: "bg-pink-500/10" },
    { icon: Shield, label: "System", description: "System-wide configuration (Super Admins only)", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences and system configuration.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sections.map(({ icon: Icon, label, description, color, bg }) => (
                    <div key={label} className="rounded-xl border bg-card text-card-foreground shadow p-6 hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className={`inline-flex p-2 rounded-lg ${bg} mb-4`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <h3 className="font-semibold mb-1">{label}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <h3 className="font-semibold mb-1">System Information</h3>
                <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Application</span>
                        <span className="font-medium">SAMS v1.0.0</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Framework</span>
                        <span className="font-medium">Next.js 16 (Turbopack)</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Database</span>
                        <span className="font-medium">Neon PostgreSQL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
