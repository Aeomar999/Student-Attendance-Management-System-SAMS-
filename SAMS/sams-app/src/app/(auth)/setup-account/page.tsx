import { getSetupTokenDetails } from "@/app/actions/auth";
import { SetupAccountForm } from "./setup-form";

export const metadata = {
    title: "Setup Account | SAMS",
    description: "Set up your SAMS account password",
};

export default async function SetupAccountPage({
    searchParams,
}: {
    searchParams: { token?: string };
}) {
    const token = await Promise.resolve(searchParams.token);

    if (!token) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-red-600">
                            Invalid Link
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            No setup token provided. Please use the link sent to your email.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { success, data, error } = await getSetupTokenDetails(token);

    if (!success || !data) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-red-600">
                            Expired or Invalid Link
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {error || "This setup link is no longer valid. Please request a new one from your administrator."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome to SAMS
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Set up your password for <strong>{data.email}</strong>
                    </p>
                </div>
                <div className="grid gap-6">
                    <SetupAccountForm token={token} />
                </div>
            </div>
        </div>
    );
}
