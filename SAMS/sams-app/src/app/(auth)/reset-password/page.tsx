"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { resetPasswordWithToken } from "@/app/actions/auth";
function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("");

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setErrorMessage("Password must be at least 8 characters.");
            return;
        }

        if (!token) {
            setErrorMessage("Invalid reset link. Please request a new one.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await resetPasswordWithToken(token, password);
            if (result.success) {
                setSuccess(true);
            } else {
                setErrorMessage(result.error || "Failed to reset password.");
            }
        } catch {
            setErrorMessage("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!token) {
        return (
            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Invalid reset link</h1>
                <p className="text-sm text-muted-foreground">
                    This password reset link is invalid or has expired.
                </p>
                <Link
                    href="/forgot-password"
                    className="text-sm font-medium hover:text-primary transition-colors mt-2"
                >
                    Request a new reset link
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Password reset!</h1>
                <p className="text-sm text-muted-foreground">
                    Your password has been successfully updated. You can now log in.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Go to login
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col space-y-2 text-center pb-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Set new password
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter a new password for your account. Must be at least 8 characters.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium leading-none">
                        New password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                        Confirm password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    />
                </div>
                {errorMessage && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {errorMessage}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || !password || !confirmPassword}
                    className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                    {isSubmitting ? "Resetting..." : "Reset password"}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6 lg:p-8 max-lg:border max-lg:border-white/20 max-lg:rounded-xl max-lg:text-white [&_input]:max-lg:bg-white/5 [&_input]:max-lg:border-white/20 [&_input]:max-lg:text-white [&_p.text-muted-foreground]:max-lg:text-zinc-400 [&_a]:max-lg:text-primary [&_label]:max-lg:text-white">
            <Suspense fallback={<div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
