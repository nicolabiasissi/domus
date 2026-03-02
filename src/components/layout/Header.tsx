"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { LogOut, User, ChevronDown } from "lucide-react";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
    user: Session["user"];
}

export default function Header({ user }: HeaderProps) {
    return (
        <header className="dashboard-header" style={{ padding: "16px 32px" }}>
            <div className="header-welcome">
                <p className="header-greeting" style={{ fontSize: 15 }}>
                    Ciao, <strong style={{ fontWeight: 800 }}>{user?.name || user?.email?.split("@")[0]}</strong>
                </p>
            </div>

            <div className="header-actions" style={{ gap: 16 }}>
                <NotificationBell />

                <div style={{ width: 1, height: 24, background: "var(--card-border)" }} />

                <div className="header-user-dropdown" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <div className="avatar" style={{ width: 34, height: 34, border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <User size={18} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{user?.name || "Profilo"}</span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>Piano Pro</span>
                    </div>
                    <ChevronDown size={14} style={{ color: "var(--muted)" }} />
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="btn-ghost"
                    style={{ borderRadius: 99, color: "var(--danger)" }}
                    title="Esci"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
}
