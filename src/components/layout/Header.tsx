"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
    user: Session["user"];
}

export default function Header({ user }: HeaderProps) {
    return (
        <header className="dashboard-header">
            <div className="header-welcome">
                <p className="header-greeting">Ciao, <strong>{user?.name || user?.email?.split("@")[0]}</strong> 👋</p>
            </div>
            <div className="header-actions">
                <div className="header-user">
                    <div className="avatar">
                        <User size={16} />
                    </div>
                    <span className="header-email">{user?.email}</span>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="btn-ghost btn-sm"
                    title="Esci"
                >
                    <LogOut size={16} />
                    Esci
                </button>
            </div>
        </header>
    );
}
