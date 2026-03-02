"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Bell, Check, CheckCheck, Filter, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
            case "WARNING": return { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500", border: "border-l-yellow-500" }
            case "ALERT": return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive", border: "border-l-destructive" }
            case "SUCCESS": return { icon: CheckCircle, color: "text-primary", bg: "bg-primary", border: "border-l-primary" }
            default: return { icon: Info, color: "text-blue-500", bg: "bg-blue-500", border: "border-l-blue-500" }
        }
    }

    const config = getTypeConfig(notification.type)
    const Icon = config.icon

    return (
        <div className={`relative flex items-start gap-3 border-b border-border/40 border-l-4 p-4 text-sm transition-colors last:border-b-0
            ${config.border}
            ${notification.isRead ? "opacity-60 bg-transparent" : "bg-muted/10 hover:bg-muted/20"}`}>
            <div className={`shrink-0 p-2 rounded-full ${config.bg}/10 ${config.color}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{notification.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {notification.message}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                </div>
            </div>
            {!notification.isRead && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkRead(notification.id)}
                    className="shrink-0 h-6 w-6 text-muted-foreground hover:text-primary rounded"
                    title="Mark as read"
                >
                    <Check className="h-3.5 w-3.5" />
                </Button>
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
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-[calc(-50vw+1.5rem)] sm:right-0 top-full mt-2 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] overflow-y-auto rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="sticky top-0 flex flex-col gap-3 border-b border-border/50 bg-card/95 backdrop-blur-xl p-4 z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold tracking-tight text-foreground">Notifications</h3>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={handleMarkAllRead}
                                        className="h-auto p-0 flex items-center gap-1 text-xs text-primary"
                                    >
                                        <CheckCheck className="h-3 w-3" /> Mark all read
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <Select value={filter} onValueChange={(val) => setFilter(val as NotificationFilter)}>
                                    <SelectTrigger className="h-8 text-xs font-medium bg-muted/30 border-none border-border/50 rounded-full px-3 w-full">
                                        <SelectValue placeholder="Filter notifications" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
