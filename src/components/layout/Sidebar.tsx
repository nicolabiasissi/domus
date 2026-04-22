"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Receipt, Inbox, Settings } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const navItems = [
    { href: "/", label: "Panorama", icon: LayoutDashboard },
    { href: "/properties", label: "Immobili", icon: Building2 },
    { href: "/expenses", label: "Contabilità", icon: Receipt },
    { href: "/inbox", label: "AI Inbox", icon: Inbox, badge: "NEW" },
];

const bottomItems = [
    { href: "/settings", label: "Impostazioni", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div style={{ marginBottom: 32, paddingLeft: 4 }}>
                <Logo size="md" />
            </div>

            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                {navItems.map(({ href, label, icon: Icon, badge }) => {
                    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                        >
                            <Icon size={18} />
                            <span style={{ flex: 1 }}>{label}</span>
                            {badge && (
                                <span className="badge-upcoming" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4 }}>
                                    {badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-bottom" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                {bottomItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
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
                <div style={{ marginTop: 24, fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", paddingLeft: 16 }}>
                    DOMUS v0.2
                </div>
            </div>
        </aside>
    );
}
