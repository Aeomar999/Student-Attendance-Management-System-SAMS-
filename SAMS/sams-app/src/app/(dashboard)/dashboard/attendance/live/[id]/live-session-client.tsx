"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Webcam from "react-webcam"
import Link from "next/link"
import { ArrowLeft, Play, Square, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SessionInfo {
    id: string
    courseId: string
    courseCode: string
    courseName: string
    lecturerName: string | null
    sessionDate: string
    startTime: string
    endTime: string | null
    status: string
    gracePeriod: number
}

interface MatchResult {
    studentId: string
    studentName: string
    confidence: number
    status: "PRESENT" | "LATE"
}

export function LiveSessionClient({ session }: { session: SessionInfo }) {
    const webcamRef = useRef<Webcam>(null)
    const [isStreaming, setIsStreaming] = useState(false)
    const [recentMatches, setRecentMatches] = useState<MatchResult[]>([])
    const [stats, setStats] = useState({ present: 0, late: 0, total: 0 })

    const processFrame = useCallback(async () => {
        if (!isStreaming || !webcamRef.current) return

        const imageSrc = webcamRef.current.getScreenshot()
        if (!imageSrc) return

        try {
            const res = await fetch("/api/attendance/recognize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    sessionId: session.id, 
                    image: imageSrc,
                    threshold: 0.60
                })
            })
            
            const data = await res.json()
            if (data.success && data.matches && data.matches.length > 0) {
                setRecentMatches(prev => {
                    const newMatches = [...data.matches, ...prev]
                    const unique = newMatches.filter((v, i, a) => a.findIndex(t => t.studentId === v.studentId) === i)
                    return unique.slice(0, 10)
                })

                data.matches.forEach((m: MatchResult) => {
                    toast.success(`Recognized: ${m.studentName} (${m.status})`)
                    if (m.status === "PRESENT") setStats(s => ({ ...s, present: s.present + 1, total: s.total + 1 }))
                    if (m.status === "LATE") setStats(s => ({ ...s, late: s.late + 1, total: s.total + 1 }))
                })
            }
        } catch (error) {
            console.error("Frame processing error:", error)
        }

    }, [isStreaming, session.id])

    useEffect(() => {
        if (!isStreaming) return
        const interval = setInterval(processFrame, 3000)
        return () => clearInterval(interval)
    }, [isStreaming, processFrame])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Link href={`/dashboard/attendance/${session.id}`}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Live Session: {session.courseCode}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(session.sessionDate), "EEEE, MMMM d, yyyy")}
                        {" · "}
                        {session.startTime ? format(new Date(session.startTime), "HH:mm") : ""}
                    </p>
                </div>
                <Badge variant={isStreaming ? "default" : "secondary"} className={isStreaming ? "animate-pulse bg-red-500 text-white" : ""}>
                    {isStreaming ? "● LIVE" : "PAUSED"}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 overflow-hidden bg-black flex items-center justify-center min-h-[400px] relative">
                    {session.status !== "ACTIVE" ? (
                        <div className="text-white flex flex-col items-center">
                            <Square className="h-12 w-12 mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-semibold">Session is {session.status.toLowerCase()}</h3>
                            <p className="text-sm text-muted">You can only run live detection on ACTIVE sessions.</p>
                        </div>
                    ) : (
                        <>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                                className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? "opacity-100" : "opacity-50"}`}
                            />
                            {!isStreaming && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <Button size="lg" onClick={() => setIsStreaming(true)} className="gap-2">
                                        <Play className="h-5 w-5" /> Start Live Monitoring
                                    </Button>
                                </div>
                            )}
                            {isStreaming && (
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                                    <div className="bg-black/50 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Analyzing stream...
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => setIsStreaming(false)} className="gap-2">
                                        <Square className="h-4 w-4" fill="currentColor" /> Stop
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-4">Live Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-primary/10 rounded-lg p-3 text-center">
                                    <div className="text-3xl font-bold text-primary">{stats.present}</div>
                                    <div className="text-xs font-semibold text-primary uppercase tracking-wider">Present</div>
                                </div>
                                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                                    <div className="text-3xl font-bold text-yellow-600">{stats.late}</div>
                                    <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Late</div>
                                </div>
                            </div>
                            <div className="mt-4 text-center text-sm text-muted-foreground hover:underline cursor-pointer">
                                <Link href={`/dashboard/attendance/${session.id}`}>
                                    View full record list &rarr;
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <div className="px-6 py-4 border-b">
                                <h3 className="font-semibold text-sm inline-flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Recently Recognized
                                </h3>
                            </div>
                            <div className="p-2 h-[300px] overflow-y-auto space-y-1">
                                {recentMatches.length === 0 ? (
                                    <div className="text-center py-8 text-sm text-muted-foreground">
                                        No students recognized yet.
                                    </div>
                                ) : (
                                    recentMatches.map((m, idx) => (
                                        <div key={`${m.studentId}-${idx}`} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors">
                                            <div>
                                                <p className="font-medium text-sm">{m.studentName}</p>
                                                <p className="text-xs text-muted-foreground">Confidence: {(m.confidence * 100).toFixed(1)}%</p>
                                            </div>
                                            <Badge variant={m.status === "PRESENT" ? "default" : "secondary"} className={m.status === "LATE" ? "bg-yellow-100 text-yellow-800" : ""}>
                                                {m.status}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
