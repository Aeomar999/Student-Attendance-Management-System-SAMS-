import { getSetupTokenDetails } from "@/app/actions/auth";
import { SetupAccountForm } from "./setup-form";
import { AlertTriangle } from "lucide-react";

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
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-500 relative z-10 
            max-lg:text-white 
            [&_input]:max-lg:bg-zinc-900/50 [&_input]:max-lg:border [&_input]:max-lg:border-white/40 [&_input]:max-lg:text-white [&_input]:max-lg:placeholder:text-zinc-500
            [&_p.text-muted-foreground]:max-lg:text-zinc-400 
            [&_a]:max-lg:text-zinc-300 [&_a:hover]:max-lg:text-white 
            [&_label]:max-lg:text-zinc-200 
            [&_button]:max-lg:bg-white [&_button]:max-lg:text-zinc-950 [&_button:hover]:max-lg:bg-zinc-300">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <h1 className="text-2xl font-bold text-destructive mb-2">
                        Invalid Link
                    </h1>
                    <p className="text-destructive/80">
                        No setup token provided. Please use the link sent to your email.
                    </p>
                </div>
            </div>
        );
    }

    const { success, data, error } = await getSetupTokenDetails(token);

    if (!success || !data) {
        return (
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-500 relative z-10 
            max-lg:text-white 
            [&_input]:max-lg:bg-zinc-900/50 [&_input]:max-lg:border [&_input]:max-lg:border-white/40 [&_input]:max-lg:text-white [&_input]:max-lg:placeholder:text-zinc-500
            [&_p.text-muted-foreground]:max-lg:text-zinc-400 
            [&_a]:max-lg:text-zinc-300 [&_a:hover]:max-lg:text-white 
            [&_label]:max-lg:text-zinc-200 
            [&_button]:max-lg:bg-white [&_button]:max-lg:text-zinc-950 [&_button:hover]:max-lg:bg-zinc-300">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <h1 className="text-2xl font-bold text-destructive mb-2">
                        Expired or Invalid Link
                    </h1>
                    <p className="text-destructive/80">
                        {error || "This setup link is no longer valid. Please request a new one from your administrator."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-500 relative z-10 
            max-lg:text-white 
            [&_input]:max-lg:bg-zinc-900/50 [&_input]:max-lg:border [&_input]:max-lg:border-white/40 [&_input]:max-lg:text-white [&_input]:max-lg:placeholder:text-zinc-500
            [&_p.text-muted-foreground]:max-lg:text-zinc-400 
            [&_a]:max-lg:text-zinc-300 [&_a:hover]:max-lg:text-white 
            [&_label]:max-lg:text-zinc-200 
            [&_button]:max-lg:bg-white [&_button]:max-lg:text-zinc-950 [&_button:hover]:max-lg:bg-zinc-300">
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
        </div>
    );
}
