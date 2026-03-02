"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Trash2, MailOpen, Inbox as InboxIcon, Sparkles } from "lucide-react";

interface IngestedEmail {
    id: string;
    subject: string | null;
    fromAddress: string | null;
    receivedAt: string;
    isBill: boolean;
    confidence: number | null;
    status: string;
    expense: { id: string; amount: number; category: string; description: string | null } | null;
}

const statusMeta: Record<string, { label: string; cls: string; color: string }> = {
    PENDING: { label: "In attesa", cls: "badge-warning", color: "var(--warning)" },
    DETECTED: { label: "Rilevata", cls: "badge-primary", color: "var(--primary)" },
    PARSED: { label: "Analizzata", cls: "badge-primary", color: "var(--primary)" },
    MATCHED: { label: "Abbinata", cls: "badge-primary", color: "var(--primary)" },
    CREATED: { label: "Aggiunta", cls: "badge-success", color: "var(--success)" },
    SKIPPED: { label: "Ignorata", cls: "badge-muted", color: "var(--muted)" },
    FAILED: { label: "Errore", cls: "badge-danger", color: "var(--danger)" },
};

function fmtEur(n: number) {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

export default function InboxPage() {
    const [emails, setEmails] = useState<IngestedEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("ALL");

    useEffect(() => {
        const loadInbox = async () => {
            try {
                const res = await fetch("/api/ingested-emails");
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const text = await res.text();
                if (text) {
                    setEmails(JSON.parse(text));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadInbox();
    }, []);

    const filtered = emails.filter(e => filter === "ALL" || e.status === filter);

    const counts = {
        ALL: emails.length,
        CREATED: emails.filter(e => e.status === "CREATED").length,
        PENDING: emails.filter(e => ["PENDING", "DETECTED", "PARSED"].includes(e.status)).length,
        FAILED: emails.filter(e => e.status === "FAILED").length,
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <div className="dashboard-fade-in">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 28, letterSpacing: "-0.5px" }}>AI Inbox</h1>
                    <p className="page-subtitle">Flusso delle bollette processate dall&apos;intelligenza artificiale.</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                        <Sparkles size={14} />
                        AI Attiva
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="kpi-grid" style={{ marginBottom: 32, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                <div className="kpi-card premium-card">
                    <div className="kpi-label">Monitorate</div>
                    <div className="kpi-value">{counts.ALL}</div>
                </div>
                <div className="kpi-card premium-card">
                    <div className="kpi-label" style={{ color: "var(--success)" }}>Riconosciute</div>
                    <div className="kpi-value" style={{ color: "var(--success)" }}>{counts.CREATED}</div>
                </div>
                <div className="kpi-card premium-card">
                    <div className="kpi-label" style={{ color: "var(--warning)" }}>In attesa</div>
                    <div className="kpi-value" style={{ color: "var(--warning)" }}>{counts.PENDING}</div>
                </div>
                <div className="kpi-card premium-card">
                    <div className="kpi-label" style={{ color: "var(--danger)" }}>Anomalie</div>
                    <div className="kpi-value" style={{ color: "var(--danger)" }}>{counts.FAILED}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar" style={{ marginBottom: 24, gap: 8 }}>
                {["ALL", "CREATED", "PENDING", "FAILED"].map(s => (
                    <button
                        key={s}
                        className={filter === s ? "btn-primary" : "btn-secondary"}
                        onClick={() => setFilter(s)}
                        style={{ borderRadius: 99, padding: "8px 20px", fontSize: 13 }}
                    >
                        {s === "ALL" ? "Tutte" : statusMeta[s]?.label ?? s}
                    </button>
                ))}
            </div>

            {/* Email List */}
            {filtered.length === 0 ? (
                <div className="empty-state-card" style={{ padding: "100px 40px" }}>
                    <div className="empty-icon" style={{ opacity: 0.3 }}><InboxIcon size={48} /></div>
                    <p className="empty-title">Nessuna bolletta rilevata</p>
                    <p className="empty-sub">
                        {emails.length === 0
                            ? "Connetti il tuo provider email per iniziare l'analisi automatica."
                            : "Nessuna email corrisponde al filtro selezionato."}
                    </p>
                </div>
            ) : (
                <div className="expense-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filtered.map(email => {
                        const meta = statusMeta[email.status] ?? { label: email.status, cls: "badge-muted", color: "var(--muted)" };
                        return (
                            <div key={email.id} className="expense-item premium-card" style={{ padding: "16px 24px", borderRadius: 16, border: "none" }}>
                                <div className="expense-icon" style={{ background: "var(--muted-bg)", padding: 12, borderRadius: 12 }}>
                                    {email.status === "CREATED" ? <CheckCircle size={20} style={{ color: "var(--success)" }} /> :
                                        email.status === "FAILED" ? <XCircle size={20} style={{ color: "var(--danger)" }} /> :
                                            <Clock size={20} style={{ color: "var(--warning)" }} />}
                                </div>
                                <div className="expense-info">
                                    <div className="expense-desc" style={{ fontWeight: 700, fontSize: 16 }}>{email.subject || "Bolletta senza oggetto"}</div>
                                    <div className="expense-meta" style={{ marginTop: 4 }}>
                                        <span style={{ fontWeight: 600 }}>{email.fromAddress}</span>
                                        <span>·</span>
                                        <span>{new Date(email.receivedAt).toLocaleDateString("it-IT")}</span>
                                        {email.confidence !== null && (
                                            <>
                                                <span>·</span>
                                                <span style={{ color: "var(--primary)", fontWeight: 700 }}>AI: {Math.round(email.confidence * 100)}%</span>
                                            </>
                                        )}
                                    </div>
                                    {email.expense && (
                                        <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 10, background: "var(--success-bg)", padding: "4px 12px", borderRadius: 8 }}>
                                            <span style={{ color: "var(--success)", fontWeight: 800, fontSize: 14 }}>{fmtEur(email.expense.amount)}</span>
                                            <span style={{ width: 1, height: 12, background: "rgba(34, 197, 94, 0.3)" }} />
                                            <span style={{ color: "var(--success)", fontSize: 12, fontWeight: 600 }}>{email.expense.category}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="expense-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                                    <div style={{ background: meta.color, color: "white", padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                                        {meta.label.toUpperCase()}
                                    </div>
                                    <div className="expense-actions">
                                        <button className="btn-ghost" style={{ padding: 8, borderRadius: 8 }}>
                                            <MailOpen size={16} />
                                        </button>
                                        <button className="btn-ghost" style={{ padding: 8, borderRadius: 8, color: "var(--danger)" }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
