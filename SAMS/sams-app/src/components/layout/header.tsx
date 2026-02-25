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
import { Menu } from "lucide-react";

export function Header() {
    const { data: session } = useSession();

    // Create a placeholder avatar fallback from the email
    const getInitials = (email?: string | null) => {
        if (!email) return "U";
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <header className="flex h-16 items-center justify-between border-b px-6 bg-background">
            <div className="flex items-center">
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle mobile menu</span>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt={session?.user?.email || "User"} />
                                <AvatarFallback>{getInitials(session?.user?.email)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    User Account
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
