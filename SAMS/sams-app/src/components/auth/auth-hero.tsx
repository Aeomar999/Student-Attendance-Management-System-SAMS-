"use client";

import { motion } from "framer-motion";
import { ScanFace, Fingerprint, ShieldCheck, Zap } from "lucide-react";

export function AuthHero() {
    return (
        <div className="relative hidden h-full w-full flex-col bg-zinc-950 p-10 text-white dark:border-r lg:flex overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-zinc-950" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-zinc-950/0 pointer-events-none" />
            
            {/* Animated Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '4rem 4rem',
                    maskImage: 'linear-gradient(to bottom right, black 20%, transparent 80%)',
                    WebkitMaskImage: 'linear-gradient(to bottom right, black 20%, transparent 80%)'
                }}
            />

            {/* Glowing Orb */}
            <motion.div 
                className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Header Identity */}
            <div className="relative z-20 flex items-center text-xl font-bold tracking-tight">
                <div className="flex items-center justify-center mr-3 h-10 w-10 rounded-lg bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm">
                    <ScanFace className="h-6 w-6" />
                </div>
                <span>SAMS <span className="text-primary font-medium">Platform</span></span>
            </div>

            {/* Main Center Content */}
            <div className="relative z-20 my-auto w-full max-w-[500px]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6 backdrop-blur-sm">
                        <Zap className="mr-2 h-4 w-4" />
                        Next-Gen Attendance
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                        Seamless & Secure <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                            Facial Recognition
                        </span>
                    </h1>
                    
                    <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-md">
                        Transforming campus environments with hyper-accurate, frictionless attendance tracking powered by cutting-edge AI.
                    </p>
                </motion.div>

                {/* Feature Pills */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="flex flex-wrap gap-3 mt-10"
                >
                    <div className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-zinc-300">
                        <ScanFace className="h-4 w-4 text-primary" /> Millisecond Processing
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-zinc-300">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" /> AES-256 Encryption
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-zinc-300">
                        <Fingerprint className="h-4 w-4 text-blue-400" /> Biometric Identity
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="relative z-20 mt-auto border-t border-white/10 pt-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500">
                        &copy; {new Date().getFullYear()} Smart Attendance Management System.
                    </p>
                    <div className="flex gap-4 text-zinc-500">
                        <p className="text-sm font-medium hover:text-white transition-colors cursor-pointer">Security</p>
                        <p className="text-sm font-medium hover:text-white transition-colors cursor-pointer">Privacy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
