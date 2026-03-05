import { getSetupTokenDetails } from "@/app/actions/auth";
import { SetupAccountForm } from "./setup-form";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Setup Account | SAMS",
    description: "Set up your SAMS account password",
};

export default async function SetupAccountPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const params = await searchParams;
    const token = params.token;

    if (!token) {
        return (
            <Card className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-500 max-lg:bg-transparent max-lg:border-none max-lg:shadow-none">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <h1 className="text-2xl font-bold text-destructive mb-2">
                        Invalid Link
                    </h1>
                    <p className="text-destructive/80">
                        No setup token provided. Please use the link sent to your email.
                    </p>
                </div>
            </Card>
        );
    }

    const { success, data, error } = await getSetupTokenDetails(token);

    if (!success || !data) {
        return (
            <Card className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-500 max-lg:bg-transparent max-lg:border-none max-lg:shadow-none">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <h1 className="text-2xl font-bold text-destructive mb-2">
                        Expired or Invalid Link
                    </h1>
                    <p className="text-destructive/80">
                        {error || "This setup link is no longer valid. Please request a new one from your administrator."}
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-500 max-lg:bg-transparent max-lg:border-none max-lg:shadow-none">
            <div className="flex flex-col space-y-2 text-center pb-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome to SAMS
                </h1>
                <p className="text-sm text-muted-foreground">
                    Set up your password for <strong className="font-medium text-foreground">{data.email}</strong>
                </p>
            </div>
            <div className="grid gap-6">
                <SetupAccountForm token={token} />
            </div>
        </Card>
    );
}
