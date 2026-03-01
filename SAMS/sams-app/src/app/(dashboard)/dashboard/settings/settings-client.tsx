"use client"

import { useState } from "react"
import { Settings, User, Shield, Smartphone, Eye, EyeOff, QrCode } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { updateProfile, changePassword, generateMfaSetup, enableMfa, disableMfa } from "@/app/actions/settings"

type UserData = {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    status: string
    mfaEnabled: boolean
    createdAt: string
    lastLoginAt: string | null
}

type Props = { user: UserData | null }

export function SettingsClient({ user }: Props) {
    const [firstName, setFirstName] = useState(user?.firstName ?? "")
    const [lastName, setLastName] = useState(user?.lastName ?? "")
    const [profileLoading, setProfileLoading] = useState(false)

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)

    // MFA state
    const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled ?? false)
    const [mfaSetup, setMfaSetup] = useState<{ secret: string; qrDataUri: string } | null>(null)
    const [mfaCode, setMfaCode] = useState("")
    const [mfaStatusLoading, setMfaStatusLoading] = useState(false)
    const [showSetupDialog, setShowSetupDialog] = useState(false)
    
    // Disable MFA state
    const [disablePassword, setDisablePassword] = useState("")
    const [showDisableDialog, setShowDisableDialog] = useState(false)

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfileLoading(true)
        try {
            const result = await updateProfile({ firstName, lastName })
            if (result.success) {
                toast.success("Profile updated successfully")
            } else {
                toast.error(result.error ?? "Failed to update profile")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setProfileLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            return
        }
        setPasswordLoading(true)
        try {
            const result = await changePassword({ currentPassword, newPassword })
            if (result.success) {
                toast.success("Password changed successfully")
                setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
            } else {
                toast.error(result.error ?? "Failed to change password")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleStartMfaSetup = async () => {
        setMfaStatusLoading(true)
        try {
            const result = await generateMfaSetup()
            if (result.success && result.data) {
                setMfaSetup(result.data)
                setShowSetupDialog(true)
            } else {
                toast.error(result.error || "Failed to generate MFA setup")
            }
        } finally {
            setMfaStatusLoading(false)
        }
    }

    const handleEnableMfa = async () => {
        if (mfaCode.length !== 6) {
            toast.error("Please enter a valid 6-digit code")
            return
        }
        setMfaStatusLoading(true)
        try {
            const result = await enableMfa(mfaCode, mfaSetup?.secret)
            if (result.success) {
                toast.success("Two-Factor Authentication enabled")
                setMfaEnabled(true)
                setShowSetupDialog(false)
                setMfaCode("")
                setMfaSetup(null)
            } else {
                toast.error(result.error || "Invalid verification code")
            }
        } finally {
            setMfaStatusLoading(false)
        }
    }

    const handleDisableMfa = async () => {
        if (!disablePassword) {
            toast.error("Password required to disable 2FA")
            return
        }
        setMfaStatusLoading(true)
        try {
            const result = await disableMfa(disablePassword)
            if (result.success) {
                toast.success("Two-Factor Authentication disabled")
                setMfaEnabled(false)
                setShowDisableDialog(false)
                setDisablePassword("")
            } else {
                toast.error(result.error || "Incorrect password")
            }
        } finally {
            setMfaStatusLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your account and security</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
                {/* Account Info */}
                {user && (
                <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-border/50 rounded-2xl md:col-span-1 lg:col-span-1 order-1 lg:order-2 flex flex-col h-full">
                    <CardHeader className="p-6 pb-4">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base font-semibold">Account Information</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-2 flex-1 flex flex-col justify-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
                                <p className="font-medium text-foreground">{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</span>
                                <div><Badge variant="outline" className="rounded-full px-3 py-0.5">{user?.role?.replace("_", " ")}</Badge></div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
                                <div><Badge className={`rounded-full px-3 py-0.5 shadow-none ${user?.status === "ACTIVE" ? "bg-primary/10 text-primary border-primary/20" : ""}`}>{user?.status?.charAt(0).toUpperCase() + user?.status?.slice(1).toLowerCase()}</Badge></div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member Since</span>
                                <p className="font-medium text-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ""}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                )}
            {/* Profile Form */}
            <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-border/50 rounded-2xl md:col-span-2 lg:col-span-2 order-2 lg:order-1 flex flex-col h-full">
                <CardHeader className="p-6 pb-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base font-semibold">Profile Details</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between">
                    <form onSubmit={handleProfileUpdate} className="space-y-6 h-full flex flex-col">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                            <div className="space-y-3">
                                <Label htmlFor="firstName" className="text-sm font-semibold">First Name</Label>
                                <Input id="firstName" value={firstName}
                                    className="bg-muted/30 focus-visible:bg-background h-11"
                                    onChange={e => setFirstName(e.target.value)}
                                    required disabled={profileLoading} />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="lastName" className="text-sm font-semibold">Last Name</Label>
                                <Input id="lastName" value={lastName}
                                    className="bg-muted/30 focus-visible:bg-background h-11"
                                    onChange={e => setLastName(e.target.value)}
                                    required disabled={profileLoading} />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 mt-auto">
                            <Button type="submit" disabled={profileLoading} className="px-8 rounded-full shadow-sm">
                                {profileLoading ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Password Form */}
            <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-border/50 rounded-2xl md:col-span-1 lg:col-span-1 order-3 flex flex-col h-full">
                <CardHeader className="p-6 pb-4">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between">
                    <form onSubmit={handlePasswordChange} className="space-y-5 h-full flex flex-col">
                        <div className="space-y-2 flex-1">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <Input id="currentPassword"
                                        type={showCurrentPw ? "text" : "password"}
                                        value={currentPassword}
                                        className="bg-muted/30 focus-visible:bg-background pr-10"
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        required disabled={passwordLoading} />
                                    <Button type="button" variant="ghost" size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent rounded-r-md"
                                        onClick={() => setShowCurrentPw(v => !v)}>
                                        {showCurrentPw ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input id="newPassword"
                                        type={showNewPw ? "text" : "password"}
                                        value={newPassword}
                                        className="bg-muted/30 focus-visible:bg-background pr-10"
                                        onChange={e => setNewPassword(e.target.value)}
                                        required disabled={passwordLoading} />
                                    <Button type="button" variant="ghost" size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent rounded-r-md"
                                        onClick={() => setShowNewPw(v => !v)}>
                                        {showNewPw ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    className="bg-muted/30 focus-visible:bg-background"
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required disabled={passwordLoading} />
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">
                                Min 12 chars · uppercase · lowercase · number · special character
                            </p>
                        </div>
                        <div className="flex justify-end pt-6 mt-auto">
                            <Button type="submit" disabled={passwordLoading || !currentPassword || !newPassword} className="w-full sm:w-auto rounded-full shadow-sm">
                                {passwordLoading ? "Changing..." : "Change Password"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-border/50 rounded-2xl md:col-span-2 lg:col-span-2 order-4 flex flex-col h-full">
                <CardHeader className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base font-semibold">Two-Factor Authentication (2FA)</CardTitle>
                        </div>
                        <Badge variant={mfaEnabled ? "default" : "secondary"} className={`rounded-full px-2.5 ${mfaEnabled ? "bg-primary/10 text-primary" : ""}`}>
                            {mfaEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-6 flex-1 flex flex-col justify-between">
                    <CardDescription className="text-sm text-foreground/80 leading-relaxed max-w-xl">
                        Protect your account by requiring an additional verification code from an authenticator app when you sign in. This ensures that even if someone gets your password, they cannot access your account.
                    </CardDescription>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border border-border/50 p-5 rounded-2xl bg-secondary/10 shadow-sm mt-auto">
                        <div className="bg-primary/10 p-4 rounded-2xl shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
                            <QrCode className="h-8 w-8 text-primary relative z-10" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <p className="font-semibold text-lg text-foreground">Authenticator App</p>
                            <p className="text-sm text-muted-foreground">Use Google Authenticator, Authy, or Microsoft Authenticator to generate verification codes.</p>
                        </div>
                        <div className="w-full sm:w-auto pt-2 sm:pt-0 shrink-0">
                            {mfaEnabled ? (
                                <Button variant="destructive" onClick={() => setShowDisableDialog(true)} disabled={mfaStatusLoading} className="w-full sm:w-auto rounded-full font-medium shadow-sm">
                                    Disable 2FA
                                </Button>
                            ) : (
                                <Button onClick={handleStartMfaSetup} disabled={mfaStatusLoading} className="w-full sm:w-auto rounded-full font-medium shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                                    Set up 2FA
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            </div>

            {/* MFA Setup Modal */}
            <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                            Scan the QR code below using your authenticator app.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4 flex flex-col items-center">
                        {mfaSetup?.qrDataUri && (
                            <Card className="p-4 bg-white/90">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={mfaSetup.qrDataUri} alt="QR Code" width={200} height={200} />
                            </Card>
                        )}
                        <div className="w-full space-y-2 text-center text-sm">
                            <p className="text-muted-foreground">Or enter this setup key manually:</p>
                            <code className="bg-secondary p-1 rounded font-mono font-bold tracking-widest">{mfaSetup?.secret}</code>
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="mfaCode">Enter 6-digit code</Label>
                            <Input id="mfaCode" required placeholder="000000" maxLength={6}
                                value={mfaCode} onChange={e => setMfaCode(e.target.value)} className="text-center tracking-widest text-lg font-mono" />
                        </div>
                        <Button className="w-full" onClick={handleEnableMfa} disabled={mfaCode.length !== 6 || mfaStatusLoading}>
                            {mfaStatusLoading ? "Verifying..." : "Verify & Enable"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Disable MFA Modal */}
            <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                            Enter your account password to confirm disabling 2FA. This will make your account less secure.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="disablePassword">Account Password</Label>
                            <Input id="disablePassword" type="password" required
                                value={disablePassword} onChange={e => setDisablePassword(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setShowDisableDialog(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDisableMfa} disabled={!disablePassword || mfaStatusLoading}>
                                Disable 2FA
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
