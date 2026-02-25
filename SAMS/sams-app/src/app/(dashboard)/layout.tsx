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
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 p-6 overflow-auto bg-muted/20">
                    {children}
                </main>
            </div>
        </div>
    );
}
