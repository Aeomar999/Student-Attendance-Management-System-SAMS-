import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <div className="hidden md:flex h-full shrink-0">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
