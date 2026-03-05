import { AuthHero } from "@/components/auth/auth-hero";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 bg-background">
            {/* Left side: The shared automated AI Hero graphic for all auth pages */}
            <AuthHero />
            
            {/* Right side: The dynamic auth form (Login / Reset Password / Setup) */}
            <div className="relative z-10 w-full flex items-center justify-center p-4 lg:p-8 mobile-dark-theme">
                {children}
            </div>
        </div>
    );
}
