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
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-100">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                        <h1 className="text-2xl font-bold text-red-800 mb-2">
                            Invalid Link
                        </h1>
                        <p className="text-red-700">
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
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-100">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                        <h1 className="text-2xl font-bold text-red-800 mb-2">
                            Expired or Invalid Link
                        </h1>
                        <p className="text-red-700">
                            {error || "This setup link is no longer valid. Please request a new one from your administrator."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
                    <div className="flex flex-col space-y-2 text-center mb-6">
                        <h1 className="text-2xl font-bold text-white">
                            Welcome to SAMS
                        </h1>
                        <p className="text-slate-300">
                            Set up your password for <strong className="text-white">{data.email}</strong>
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <SetupAccountForm token={token} />
                    </div>
                </div>
            </div>
        </div>
    );
}
