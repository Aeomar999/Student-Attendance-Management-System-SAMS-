"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Bell, Check, CheckCheck, Filter, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    type Notification,
} from "@/app/actions/notifications"

const POLL_INTERVAL = 120_000 // Poll every 2 minutes instead of 1

type NotificationFilter = "all" | "ALERT" | "WARNING" | "SUCCESS" | "INFO"

const NotificationItem = memo(function NotificationItem({ 
    notification, 
    onMarkRead 
}: { 
    notification: Notification; 
    onMarkRead: (id: string) => void;
}) {
    const getTypeConfig = (type: string) => {
        switch (type) {
            case "WARNING": return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500", border: "border-l-amber-500" }
            case "ALERT": return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500", border: "border-l-red-500" }
            case "SUCCESS": return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500", border: "border-l-green-500" }
            default: return { icon: Info, color: "text-blue-500", bg: "bg-blue-500", border: "border-l-blue-500" }
        }
    }

    const config = getTypeConfig(notification.type)
    const Icon = config.icon

    return (
        <div className={`flex items-start gap-3 border-b border-l-4 px-4 py-3 text-sm transition-colors last:border-b-0
            ${config.border}
            ${notification.isRead ? "opacity-60" : "bg-muted/30"}`}>
            <div className={`shrink-0 p-1.5 rounded-full ${config.bg}/10 ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
            </div>
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
                    onClick={() => onMarkRead(notification.id)}
                    className="shrink-0 p-1 text-muted-foreground hover:text-primary rounded"
                    title="Mark as read"
                >
                    <Check className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    )
})

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [filter, setFilter] = useState<NotificationFilter>("all")

    const loadNotifications = useCallback(async () => {
        const result = await getNotifications()
        if (result.success && result.data) {
            setNotifications(result.data)
        }
    }, [])

    const filteredNotifications = notifications.filter(n => 
        filter === "all" || n.type === filter
    )

    const filterOptions: { value: NotificationFilter; label: string }[] = [
        { value: "all", label: "All" },
        { value: "ALERT", label: "Alerts" },
        { value: "WARNING", label: "Warnings" },
        { value: "SUCCESS", label: "Success" },
        { value: "INFO", label: "Info" },
    ]

    useEffect(() => {
        let mounted = true;
        
        const tick = async () => {
            if (!mounted) return;
            const result = await getUnreadCount();
            if (mounted && result.success && result.count !== undefined) {
                setUnreadCount(result.count);
            }
        };
        
        tick();
        const interval = setInterval(tick, POLL_INTERVAL);
        
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    const handleOpen = useCallback(async () => {
        if (!isOpen) {
            await loadNotifications()
        }
        setIsOpen(prev => !prev)
    }, [isOpen, loadNotifications])

    const handleMarkRead = useCallback(async (notificationId: string) => {
        const result = await markNotificationRead(notificationId)
        if (result.success) {
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }, [])

    const handleMarkAllRead = useCallback(async () => {
        const result = await markAllNotificationsRead()
        if (result.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        }
    }, [])

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
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 top-full mt-2 z-50 w-80 max-h-96 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                        <div className="sticky top-0 flex flex-col gap-2 border-b bg-popover p-3">
                            <div className="flex items-center justify-between">
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
                            <div className="flex items-center gap-2">
                                <Filter className="h-3 w-3 text-muted-foreground" />
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as NotificationFilter)}
                                    className="text-xs bg-background border rounded px-2 py-1 flex-1"
                                >
                                    {filterOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {filteredNotifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                {filter === "all" ? "No notifications yet" : `No ${filter.toLowerCase()} notifications`}
                            </div>
                        ) : (
                            filteredNotifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkRead={handleMarkRead}
                                />
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
