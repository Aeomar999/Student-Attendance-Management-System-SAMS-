"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Menu, Search, Mail } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/layout/sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export function Header() {
    const { data: session } = useSession();

    // Create a placeholder avatar fallback from the email
    const getInitials = (email?: string | null) => {
        if (!email) return "U";
        return email.substring(0, 2).toUpperCase();
    };

    const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "User";

    return (
        <header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6 bg-background text-foreground sticky top-0 z-10">
            <div className="flex items-center flex-1 gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle mobile menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-0 w-64 bg-background">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="sr-only">Main application navigation sidebar.</SheetDescription>
                        <Sidebar className="w-full border-none h-full" />
                    </SheetContent>
                </Sheet>
                
                <div className="relative hidden md:flex items-center w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="flex h-9 w-full rounded-full border-none bg-muted/50 px-3 py-1 pl-9 text-sm shadow-none transition-colors focus-visible:bg-background focus-visible:ring-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-1">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                    </Button>
                    <NotificationBell />
                </div>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-auto rounded-full pl-1 pr-3 hover:bg-muted font-normal flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt={session?.user?.email || "User"} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getInitials(session?.user?.email)}</AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start leading-none justify-center">
                                <span className="text-sm font-medium">{userName}</span>
                                <span className="text-[10px] text-muted-foreground">{session?.user?.email}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {userName}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {session?.user?.email}
                                </p>
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-1">
                                    Role: {session?.user?.role || "GUEST"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
