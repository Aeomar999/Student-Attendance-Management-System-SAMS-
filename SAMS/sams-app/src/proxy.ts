import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
    const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");

    // Allow NextAuth API routes to function normally
    if (isApiAuthRoute) {
        return null;
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
        }
        return null; // Let them access login/register
    }

    // Require authentication for all other routes
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    return null;
});

export const config = {
    // Matcher protects all routes except static assets, _next, and API routes that aren't auth
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
