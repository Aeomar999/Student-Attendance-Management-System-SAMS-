"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const result = await requestPasswordReset(email);
            if (result.success) {
                setSubmitted(true);
            } else {
                setErrorMessage(result.error || "Something went wrong.");
            }
        } catch {
            setErrorMessage("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6 lg:p-8 max-lg:bg-transparent max-lg:border-none max-lg:shadow-none">
            {submitted ? (
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <svg className="h-8 w-8 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                    <p className="text-sm text-muted-foreground">
                        If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset link.
                    </p>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                        Back to login
                    </Link>
                </div>
            ) : (
                <>
                    <div className="flex flex-col space-y-2 text-center pb-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Forgot your password?
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@institution.edu"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
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
                            disabled={isSubmitting || !email}
                            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isSubmitting ? "Sending..." : "Send reset link"}
                        </button>
                    </form>
                    <div className="text-center pt-2">
                        <Link
                            href="/login"
                            className="text-sm font-medium hover:text-primary transition-colors"
                        >
                            Back to login
                        </Link>
                    </div>
                </>
            )}
        </Card>
    );
}
