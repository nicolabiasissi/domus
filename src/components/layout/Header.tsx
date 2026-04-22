"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, ChevronDown } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useAppContext } from "@/context/AppContext";
import { Logo } from "@/components/common/Logo";

export default function Header() {
    const { user } = useAppContext();

    const getGreeting = () => {
        if (user?.language === "en") return "Welcome";
        if (user?.gender === "FEMALE") return "Benvenuta";
        if (user?.gender === "MALE") return "Benvenuto";
        if (user?.gender === "NEUTRAL") return "Benvenutə";
        return "Benvenuto/a";
    };

    return (
        <header className="dashboard-header">
            <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="header-brand" style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <Logo size="sm" />

                    <div className="header-welcome">
                        <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
                            {getGreeting()},{" "}
                            <strong style={{ color: "var(--foreground)", fontWeight: 700 }}>
                                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.name || "Utente")}
                            </strong>
                            <span style={{ margin: "0 8px", opacity: 0.3 }}>/</span>
                            Dashboard
                        </p>
                    </div>
                </div>

                <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <NotificationBell />

                    <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <User size={14} className="text-muted" />
                            )}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", color: user?.plan === "PRO" ? "var(--warning)" : "var(--muted)" }}>
                            {user?.plan || "BASIC"}
                        </span>
                    </Link>

                    <button
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                        title="Esci"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}
