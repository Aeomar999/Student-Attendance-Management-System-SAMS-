"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    type Notification,
} from "@/app/actions/notifications"

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const loadCount = useCallback(async () => {
        const result = await getUnreadCount()
        if (result.success && result.count !== undefined) {
            setUnreadCount(result.count)
        }
    }, [])

    useEffect(() => {
        // Initial load deferred to avoid synchronous setState in effect
        const timeout = setTimeout(loadCount, 0)
        const interval = setInterval(loadCount, 60_000) // Poll every minute
        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
        }
    }, [loadCount])

    async function handleOpen() {
        if (!isOpen) {
            const result = await getNotifications()
            if (result.success && result.data) {
                setNotifications(result.data)
            }
        }
        setIsOpen(!isOpen)
    }

    async function handleMarkRead(notificationId: string) {
        const result = await markNotificationRead(notificationId)
        if (result.success) {
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    async function handleMarkAllRead() {
        const result = await markAllNotificationsRead()
        if (result.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        }
    }

    const typeColor = (type: string) => {
        switch (type) {
            case "WARNING": return "border-l-amber-500"
            case "ALERT": return "border-l-red-500"
            case "SUCCESS": return "border-l-green-500"
            default: return "border-l-blue-500"
        }
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleOpen}
                className="relative"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 z-50 w-80 max-h-96 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                        <div className="sticky top-0 flex items-center justify-between border-b bg-popover px-4 py-2">
                            <h3 className="text-sm font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                    <CheckCheck className="h-3 w-3" /> Mark all read
                                </button>
                            )}
                        </div>
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-3 border-b border-l-4 px-4 py-3 text-sm transition-colors last:border-b-0
                                        ${typeColor(notification.type)}
                                        ${notification.isRead ? "opacity-60" : "bg-muted/30"}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{notification.title}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </div>
                                        <div className="text-xs text-muted-foreground/50 mt-1">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(notification.id)}
                                            className="shrink-0 p-1 text-muted-foreground hover:text-primary rounded"
                                            title="Mark as read"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
