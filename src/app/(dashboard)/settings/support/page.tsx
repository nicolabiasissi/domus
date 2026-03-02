import { ExternalLink, Mail, MessageCircle, BookOpen, Twitter, Github } from "lucide-react";

const links = [
    {
        section: "Supporto",
        items: [
            { icon: Mail, label: "Contatta il supporto", desc: "Scrivi a support@domusapp.io", href: "mailto:support@domusapp.io" },
            { icon: BookOpen, label: "Centro assistenza", desc: "Guide e domande frequenti", href: "#" },
            { icon: MessageCircle, label: "Community", desc: "Unisciti alla nostra community", href: "#" },
        ],
    },
    {
        section: "Social",
        items: [
            { icon: Twitter, label: "Twitter / X", desc: "@domusapp", href: "https://x.com/domusapp" },
            { icon: Github, label: "GitHub", desc: "Contribuisci al progetto", href: "https://github.com/domusapp" },
        ],
    },
];

export default function SupportPage() {
    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Supporto</h1>
                    <p className="page-subtitle">Hai bisogno di aiuto?</p>
                </div>
            </div>
            <div className="settings-section-stack">
                {links.map(({ section, items }) => (
                    <div key={section} className="settings-panel">
                        <div className="settings-panel-title">{section}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {items.map(({ icon: Icon, label, desc, href }) => (
                                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="support-link">
                                    <div className="support-link-icon"><Icon size={18} /></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: 14 }}>{label}</div>
                                        <div className="form-hint">{desc}</div>
                                    </div>
                                    <ExternalLink size={14} style={{ color: "var(--muted)" }} />
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="settings-panel" style={{ textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                    <p>📍 Domus v0.2 — AI Edition</p>
                    <p style={{ marginTop: 4 }}>Made with ❤️ in Italy</p>
                </div>
            </div>
        </div>
    );
}
