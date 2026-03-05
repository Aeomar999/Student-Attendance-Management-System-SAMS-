import { AuthHero } from "@/components/auth/auth-hero";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 px-4 lg:px-0 bg-background py-8 lg:py-0">
            {/* Left side: The shared automated AI Hero graphic for all auth pages */}
            <AuthHero />
            
            {/* Right side: The dynamic auth form (Login / Reset Password / Setup) */}
            <div className="lg:p-8 flex items-center justify-center w-full">
                {children}
            </div>
        </div>
    );
}
