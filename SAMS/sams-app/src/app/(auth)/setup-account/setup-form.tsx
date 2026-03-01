"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyAndSetupAccount } from "@/app/actions/auth";

export function SetupAccountForm({ token }: { token: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);
        try {
            const result = await verifyAndSetupAccount(token, password);
            if (result.success) {
                toast.success("Account setup successful!");
                router.push("/login?setup=success");
            } else {
                toast.error(result.error || "Failed to setup account");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Create a strong password"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
            </div>
            <div className="space-y-2 text-left">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Verify your password"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
            </div>
            <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                {isLoading ? "Setting up account..." : "Complete Setup"}
            </Button>
        </form>
    );
}
