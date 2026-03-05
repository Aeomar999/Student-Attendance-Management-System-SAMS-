import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

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
        <Card className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6 sm:p-8 border-none shadow-none lg:border-solid lg:shadow-sm bg-transparent lg:bg-card">
            {showSetupSuccess && (
                <div className="rounded-md bg-primary/5 border border-primary/20 p-4 text-sm text-primary">
                    Your account has been set up successfully. Please log in with your email and password.
                </div>
            )}
            {showError && (
                <div className="rounded-md bg-destructive/5 border border-destructive/20 p-4 text-sm text-destructive">
                    {showError === "unauthorized" 
                        ? "You do not have permission to access this page."
                        : "An error occurred. Please try again."}
                </div>
            )}
            <div className="flex flex-col space-y-2 text-center pb-2">
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
            <div className="text-center pt-2">
                <Link
                    href="/forgot-password"
                    className="text-sm font-medium hover:text-primary transition-colors"
                >
                    Forgot your password?
                </Link>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground mt-4">
                By clicking continue, you agree to our{" "}
                <Link
                    href="/terms"
                    className="font-medium text-foreground hover:text-primary underline underline-offset-4"
                >
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                    href="/privacy"
                    className="font-medium text-foreground hover:text-primary underline underline-offset-4"
                >
                    Privacy Policy
                </Link>
                .
            </p>
        </Card>
    );
}
