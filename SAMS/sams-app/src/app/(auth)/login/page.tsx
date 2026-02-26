import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Login | SAMS",
    description: "Login to your SAMS account",
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ setup?: string; error?: string }>;
}) {
    const params = await searchParams;
    const showSetupSuccess = params?.setup === "success";
    const showError = params?.error;

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-primary/90" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    SAMS
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &quot;Smart Attendance Management System redefines how institutions track and secure their classroom environments with cutting-edge AI.&quot;
                        </p>
                        <footer className="text-sm">SAMS Team</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    {showSetupSuccess && (
                        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                            Your account has been set up successfully. Please log in with your email and password.
                        </div>
                    )}
                    {showError && (
                        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                            {showError === "unauthorized" 
                                ? "You do not have permission to access this page."
                                : "An error occurred. Please try again."}
                        </div>
                    )}
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email and password to log in.
                        </p>
                    </div>
                    <Suspense fallback={<div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
                        <LoginForm />
                    </Suspense>
                    <div className="text-center">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
