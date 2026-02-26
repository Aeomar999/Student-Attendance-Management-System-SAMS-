"use client"

import { useState } from "react"
import { Settings, User, Shield, Eye, EyeOff, Smartphone, QrCode } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
            const result = await enableMfa(mfaCode)
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
        <div className="space-y-6 max-w-2xl">
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

            {/* Account Info */}
            {user && (
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h2 className="font-semibold">Account Information</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Email</span>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Role</span>
                            <p><Badge variant="outline" className="mt-0.5">{user.role.replace("_", " ")}</Badge></p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Status</span>
                            <p><Badge className={`mt-0.5 ${user.status === "ACTIVE" ? "bg-green-600" : ""}`}>{user.status.toLowerCase()}</Badge></p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Member Since</span>
                            <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Form */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-semibold">Profile Details</h2>
                </div>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                required disabled={profileLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                required disabled={profileLoading} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={profileLoading}>
                            {profileLoading ? "Saving..." : "Save Profile"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Password Form */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-semibold">Change Password</h2>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Input id="currentPassword"
                                type={showCurrentPw ? "text" : "password"}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required disabled={passwordLoading} />
                            <Button type="button" variant="ghost" size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowCurrentPw(v => !v)}>
                                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Input id="newPassword"
                                type={showNewPw ? "text" : "password"}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required disabled={passwordLoading} />
                            <Button type="button" variant="ghost" size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowNewPw(v => !v)}>
                                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Min 12 chars · uppercase · lowercase · number · special character
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required disabled={passwordLoading} />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={passwordLoading || !currentPassword || !newPassword}>
                            {passwordLoading ? "Changing..." : "Change Password"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <h2 className="font-semibold">Two-Factor Authentication (2FA)</h2>
                    </div>
                    <Badge variant={mfaEnabled ? "default" : "secondary"} className={mfaEnabled ? "bg-green-600" : ""}>
                        {mfaEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Protect your account by requiring an additional verification code from an authenticator app when you sign in.
                    </p>
                    <div className="flex items-center gap-4 border p-4 rounded-md bg-secondary/20">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <QrCode className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="font-medium">Authenticator App</p>
                            <p className="text-xs text-muted-foreground">Use Google Authenticator, Authy, or similar</p>
                        </div>
                        <div>
                            {mfaEnabled ? (
                                <Button variant="destructive" onClick={() => setShowDisableDialog(true)} disabled={mfaStatusLoading}>
                                    Disable
                                </Button>
                            ) : (
                                <Button onClick={handleStartMfaSetup} disabled={mfaStatusLoading}>
                                    Enable 2FA
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
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
                            <div className="p-4 bg-white rounded-lg border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={mfaSetup.qrDataUri} alt="QR Code" width={200} height={200} />
                            </div>
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
