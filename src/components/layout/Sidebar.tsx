"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Receipt } from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/properties", label: "Immobili", icon: Building2 },
    { href: "/expenses", label: "Spese", icon: Receipt },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="sidebar-logo-icon">🏠</span>
                <span className="sidebar-logo-text">DOMUS</span>
            </div>
            <nav className="sidebar-nav">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="sidebar-footer">
                <span className="sidebar-version">v0.1 — MLP</span>
            </div>
        </aside>
    );
}
