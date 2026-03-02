"use client";

import { useState, useEffect } from "react";
import { Bell, Sparkles, Check } from "lucide-react";
import Link from "next/link";

interface Notification {
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const load = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (!res.ok) {
                // Silently handle auth errors
                if (res.status === 401) return;
                return;
            }

            const text = await res.text();
            if (!text || text.trim() === "") return;

            try {
                const data = JSON.parse(text);
                setNotifications(data?.notifications || []);
                setUnreadCount(data?.unreadCount || 0);
            } catch (parseErr) {
                // Ignore parsing errors from empty or malformed responses
                console.warn("[Domus AI] Malformed notifications data", parseErr);
            }
        } catch (e) {
            // Network errors or fetch failures
            console.error("[Domus AI] Failed to load notifications", e);
        }
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async () => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });
            if (res.ok) {
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error("[Domus AI] Mark as read failed", err);
        }
    };

    return (
        <div style={{ position: "relative" }}>
            <button
                className="btn-ghost"
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && unreadCount > 0) markAsRead();
                }}
                style={{ borderRadius: 99, padding: 10, position: "relative" }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute", top: 8, right: 8,
                        width: 10, height: 10, background: "var(--danger)",
                        borderRadius: "50%", border: "2px solid white"
                    }} />
                )}
            </button>

            {isOpen && (
                <div className="premium-card" style={{
                    position: "absolute", top: "calc(100% + 12px)", right: 0,
                    width: 320, zIndex: 100, padding: 0, overflow: "hidden",
                    borderRadius: 20
                }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Notifiche</span>
                        <Sparkles size={14} style={{ color: "var(--primary)" }} />
                    </div>
                    <div style={{ maxHeight: 400, overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                                Nessuna notifica
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} style={{
                                    padding: "12px 20px", borderBottom: "1px solid var(--card-border)",
                                    background: n.isRead ? "transparent" : "var(--primary-light)",
                                    opacity: n.isRead ? 0.8 : 1
                                }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                        {!n.isRead && <span style={{ width: 6, height: 6, background: "var(--primary)", borderRadius: "50%" }} />}
                                        {n.title}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{n.body}</div>
                                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>
                                        {new Date(n.createdAt).toLocaleString("it-IT")}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <Link href="/inbox" className="btn-ghost w-full" style={{ borderRadius: 0, fontSize: 12, padding: 12 }} onClick={() => setIsOpen(false)}>
                            Vedi tutto l&apos;inbox AI
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
