"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Check } from "lucide-react";

type CaptureState = 
  | "CENTER"
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN"
  | "SUCCESS";

interface FaceEnrollmentProps {
    onComplete: (images: string[]) => void;
    onCancel: () => void;
}

const CAPTURE_STATES: CaptureState[] = ["CENTER", "LEFT", "RIGHT", "UP", "DOWN"];
const HOLD_DURATION_MS = 1500; // 1.5 seconds per pose

export function FaceEnrollment({ onComplete, onCancel }: FaceEnrollmentProps) {
    const webcamRef = useRef<Webcam>(null);
    const [isStarted, setIsStarted] = useState(false);
    const [currentState, setCurrentState] = useState<CaptureState>("CENTER");
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [cameraError, setCameraError] = useState<string | null>(null);
    
    // Progress calculation for the 60 ticks
    // If not started, progress is 0.
    // If SUCCESS, progress is 60.
    // Otherwise, scale based on CAPTURE_STATES index
    const progressIndex = currentState === "SUCCESS" ? CAPTURE_STATES.length : CAPTURE_STATES.indexOf(currentState);
    const progressTicks = isStarted ? Math.floor((progressIndex / CAPTURE_STATES.length) * 60) : 0;

    const tickCount = 60;
    const radius = 125; // Distance of ticks from center
    const cx = 150;
    const cy = 150;

    const captureCurrentFrame = useCallback(() => {
        if (!isStarted) return;
        
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImages(prev => [...prev, imageSrc]);
            
            const currentIndex = CAPTURE_STATES.indexOf(currentState);
            
            if (currentIndex < CAPTURE_STATES.length - 1) {
                setCurrentState(CAPTURE_STATES[currentIndex + 1] as CaptureState);
            } else {
                setCurrentState("SUCCESS");
            }
        }
    }, [currentState, isStarted]);

    // Timer-based mock progression
    useEffect(() => {
        if (!isStarted) return;

        if (currentState === "SUCCESS") {
            const timer = setTimeout(() => {
                onComplete(capturedImages);
            }, 1500);
            return () => clearTimeout(timer);
        }

        // Auto-capture after holding the state
        if (CAPTURE_STATES.includes(currentState)) {
            const timer = setTimeout(() => {
                captureCurrentFrame();
            }, HOLD_DURATION_MS);
            return () => clearTimeout(timer);
        }
    }, [currentState, isStarted, captureCurrentFrame, capturedImages, onComplete]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black text-white px-6 py-12">
            {/* Top Navigation */}
            <div className="w-full flex justify-between items-center max-w-md">
                <button 
                    onClick={onCancel}
                    className="h-[38px] w-[38px] flex items-center justify-center rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] transition-colors"
                >
                    {isStarted ? <X className="h-5 w-5 text-white/90" /> : <ChevronLeft className="h-6 w-6 text-white/90 -ml-0.5" />}
                </button>
            </div>

            {/* Main Visual Content */}
            <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center mt-4 space-y-16">
                
                {/* The Circular Scanner UI */}
                <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                    
                    {/* Ring of 60 ticks */}
                    <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 300 300">
                        {Array.from({ length: tickCount }).map((_, i) => {
                            const angle = (i * 360) / tickCount;
                            // Make it glow green if completed
                            const isCompleted = isStarted && (i <= progressTicks);
                            return (
                                <line
                                    key={i}
                                    x1={cx}
                                    y1={cy - radius}
                                    x2={cx}
                                    y2={cy - radius - 20}
                                    stroke={isCompleted ? "#34C759" : "#636366"}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    transform={`rotate(${angle} ${cx} ${cy})`}
                                    className="transition-colors duration-500"
                                />
                            );
                        })}
                    </svg>

                    {!isStarted ? (
                        /* Apple FaceID Icon SVG (Mocked styling) */
                        <svg className="z-10 w-[100px] h-[100px] text-white/90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="50" cy="50" r="45" />
                            {/* Eyes */}
                            <path d="M 33 40 L 33 40.5" strokeWidth="6" />
                            <path d="M 67 40 L 67 40.5" strokeWidth="6" />
                            {/* Nose */}
                            <path d="M 50 45 L 50 62 L 44 62" />
                            {/* Smile */}
                            <path d="M 38 72 Q 50 82 62 72" strokeWidth="3.5" />
                        </svg>
                    ) : (
                        /* Webcam Feed + Circular Mask + 3D Overlay */
                        <div className="absolute w-[200px] h-[200px] rounded-full overflow-hidden bg-zinc-900 border-[0.5px] border-zinc-800 z-10 flex items-center justify-center">
                            {cameraError ? (
                                <div className="text-center p-4">
                                    <p className="text-red-400 text-sm font-medium mb-1">Camera Error</p>
                                    <p className="text-xs text-zinc-400">{cameraError}</p>
                                </div>
                            ) : (
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ 
                                        facingMode: "user",
                                        width: { ideal: 720 },
                                        height: { ideal: 720 }
                                    }}
                                    className="w-[120%] h-[120%] max-w-none object-cover transform scale-x-[-1]"
                                    mirrored={true}
                                    onUserMediaError={(err: string | DOMException) => {
                                        console.error("Webcam Error:", err);
                                        const errName = typeof err === 'string' ? err : err.name;
                                        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
                                            setCameraError("Please allow camera access in your browser settings to continue.");
                                        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
                                            setCameraError("No camera found. Please ensure your device has a working camera.");
                                        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
                                            setCameraError("Camera is already in use by another application.");
                                        } else {
                                            setCameraError("Could not access camera. Please check your permissions.");
                                        }
                                    }}
                                    playsInline // Crucial for iOS/Safari
                                    muted // Crucial for autoplay policies on mobile
                                />
                            )}
                            
                            {/* Blue 3D overlay (approximating the screenshot) */}
                            <svg className="absolute lg:inset-0 w-full h-full pointer-events-none z-30 opacity-70" viewBox="0 0 100 100">
                                {/* Horizontal ellipse */}
                                <ellipse cx="50" cy="50" rx="46" ry="14" fill="none" stroke="#0A84FF" strokeWidth="0.75" />
                                {/* Vertical arc (approximating face contour) */}
                                <path d="M 50 2 A 22 48 0 0 0 50 98" fill="none" stroke="#0A84FF" strokeWidth="0.75" opacity="0.6"/>
                            </svg>
                            
                            {currentState === "SUCCESS" && (
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-40"
                                >
                                    <div className="bg-[#34C759] text-white p-3 rounded-full">
                                        <Check className="w-10 h-10" />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                {/* Text Instructions */}
                <div className="text-center space-y-[10px] px-6 h-24">
                    {!isStarted ? (
                        <>
                            <h2 className="text-[22px] font-bold tracking-tight text-white">How to Set Up Face ID</h2>
                            <p className="text-[16px] leading-snug text-[#8E8E93] max-w-[280px] mx-auto">
                                First, position your face in the camera frame. Then move your head in a circle to show all the angles of your face.
                            </p>
                        </>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentState}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="pt-2"
                            >
                                <p className="text-[17px] font-semibold tracking-tight text-white max-w-[230px] mx-auto leading-snug">
                                    {currentState === "SUCCESS" ? "Face ID is set up." : "Move your head slowly to complete the circle."}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Bottom Button */}
            <div className="w-full max-w-[400px] mb-[4vh]">
                {!isStarted ? (
                    <button 
                        onClick={() => setIsStarted(true)}
                        className="w-full bg-[#0A84FF] hover:bg-[#007AFF] text-white py-[16px] rounded-2xl text-[17px] font-bold tracking-wide transition-colors active:scale-[0.98]"
                    >
                        Get Started
                    </button>
                ) : (
                    <button 
                        className="w-full bg-transparent hover:bg-white/5 text-[#8E8E93] hover:text-white py-[16px] rounded-2xl text-[15px] font-semibold tracking-wide transition-colors"
                    >
                        Accessibility Options
                    </button>
                )}
            </div>
            
        </div>
    );
}
