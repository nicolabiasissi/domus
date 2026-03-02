"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Receipt, Inbox, Settings, Sparkles } from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/properties", label: "Immobili", icon: Building2 },
    { href: "/expenses", label: "Spese", icon: Receipt },
    { href: "/inbox", label: "AI Inbox", icon: Inbox, badge: "NEW" },
];

const bottomItems = [
    { href: "/settings", label: "Impostazioni", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar" style={{ borderRight: "1px solid var(--card-border)", background: "#ffffff" }}>
            <div className="sidebar-logo" style={{ padding: "32px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "var(--primary)", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                    <Sparkles size={18} />
                </div>
                <span className="sidebar-logo-text" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>DOMUS</span>
            </div>

            <nav className="sidebar-nav" style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                {navItems.map(({ href, label, icon: Icon, badge }) => {
                    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                            style={{
                                borderRadius: 12,
                                padding: "10px 14px",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <Icon size={20} style={{ opacity: active ? 1 : 0.7 }} />
                            <span style={{ flex: 1, fontWeight: active ? 700 : 500, fontSize: 14 }}>{label}</span>
                            {badge && (
                                <span className="sidebar-badge" style={{ fontSize: 9 }}>{badge}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-bottom" style={{ marginTop: "auto", padding: "14px" }}>
                {bottomItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                            style={{ borderRadius: 12, padding: "10px 14px" }}
                        >
                            <Icon size={20} style={{ opacity: active ? 1 : 0.7 }} />
                            <span style={{ fontWeight: active ? 700 : 500, fontSize: 14 }}>{label}</span>
                        </Link>
                    );
                })}
                <div className="sidebar-version" style={{ padding: "12px 14px", opacity: 0.5, fontSize: 10, fontWeight: 600 }}>
                    VERSION 0.2 • ARTIFICIAL INTELLIGENCE
                </div>
            </div>
        </aside>
    );
}
