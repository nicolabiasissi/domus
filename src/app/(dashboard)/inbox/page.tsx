"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Inbox as InboxIcon, Sparkles, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/currency";

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

const statusMeta: Record<string, { label: string; color: string }> = {
    PENDING: { label: "In coda", color: "var(--muted)" },
    DETECTED: { label: "Rilevata", color: "var(--warning)" },
    PARSED: { label: "Analizzata", color: "var(--warning)" },
    MATCHED: { label: "Abbinata", color: "var(--warning)" },
    CREATED: { label: "Archiviata", color: "var(--success)" },
    SKIPPED: { label: "Ignorata", color: "var(--muted)" },
    FAILED: { label: "Errore", color: "var(--danger)" },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function InboxPage() {
    const { user, loading: appLoading } = useAppContext();
    const [emails, setEmails] = useState<IngestedEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("ALL");

    useEffect(() => {
        const loadInbox = async () => {
            try {
                const res = await fetch("/api/ingested-emails");
                if (res.ok) setEmails(await res.json());
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        loadInbox();
    }, []);

    const currency = user?.currency || "EUR";
    const lang = user?.language || "it";
    const fmt = (v: number) => formatCurrency(v, currency, lang);

    const filtered = emails.filter(e => filter === "ALL" || e.status === filter);
    const pendingCount = emails.filter(e => ["PENDING", "DETECTED", "PARSED"].includes(e.status)).length;

    if (loading || appLoading) return <div className="loading-center"><div className="spinner" /></div>;

    if (user?.plan !== "PRO") {
        return (
            <div className="animate-gentle" style={{ height: "calc(100vh - 100px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="card" style={{ maxWidth: 500, padding: 64, textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.05 }}>✨</div>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--warning-bg)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
                        <Sparkles size={32} />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>AI Inbox è Pro</h2>
                    <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
                        L'automazione intelligente delle bollette tramite email richiede un piano Professionale. Risparmia tempo e azzera gli errori con il parsing AI.
                    </p>
                    <Link href="/settings/account" className="btn-primary" style={{ display: "inline-flex", padding: "14px 40px", fontSize: 15, fontWeight: 700 }}>
                        Attiva Piano Pro
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" className="animate-gentle">
            <header style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="kpi-main-label">Automazione</div>
                    <h1 className="page-title" style={{ fontSize: 40 }}>AI Inbox</h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--success)", fontSize: 12, fontWeight: 700 }}>
                    <Sparkles size={14} />
                    MOTORE AI ATTIVO
                </div>
            </header>

            <motion.section variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
                <div className="card">
                    <div className="kpi-main-label">Processate</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{emails.length}</div>
                </div>
                <div className="card">
                    <div className="kpi-main-label">In attesa</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: pendingCount > 0 ? "var(--warning)" : "var(--muted)" }}>
                        {pendingCount}
                    </div>
                </div>
            </motion.section>

            <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid var(--card-border)", paddingBottom: 12 }}>
                {(["ALL", "CREATED", "PENDING", "FAILED"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            background: "none", border: "none",
                            color: filter === f ? "var(--foreground)" : "var(--muted)",
                            fontSize: 13, fontWeight: 700, padding: "8px 16px", cursor: "pointer",
                            position: "relative"
                        }}
                    >
                        {f === "ALL" ? "Storico" : f === "CREATED" ? "Archiviate" : f === "PENDING" ? "Pendenti" : "Errori"}
                        {filter === f && (
                            <motion.div layoutId="activeFilterInbox" style={{ position: "absolute", bottom: -13, left: 0, right: 0, height: 2, background: "var(--foreground)" }} />
                        )}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <AnimatePresence>
                    {filtered.length === 0 ? (
                        <div style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}>L&apos;inbox è vuoto.</div>
                    ) : (
                        filtered.map((email) => {
                            const meta = statusMeta[email.status] || { label: email.status, color: "var(--muted)" };
                            return (
                                <motion.div
                                    layout
                                    key={email.id}
                                    variants={itemVariants}
                                    className="premium-card"
                                    style={{
                                        borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none",
                                        padding: "20px 24px", display: "flex", alignItems: "center", gap: 24,
                                        background: "transparent"
                                    }}
                                >
                                    <div style={{ width: 4, height: 24, background: meta.color, borderRadius: 2 }} />

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 700 }}>{email.subject || "Bolletta rilevata"}</div>
                                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, display: "flex", gap: 8 }}>
                                            <span>{email.fromAddress}</span>
                                            <span>·</span>
                                            {email.confidence && (
                                                <span style={{ color: "var(--foreground)", fontWeight: 700 }}>AI {Math.round(email.confidence * 100)}%</span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: "right", marginRight: 24 }}>
                                        {email.expense ? (
                                            <div style={{ fontSize: 18, fontWeight: 800 }}>{fmt(email.expense.amount)}</div>
                                        ) : (
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Analisi...</div>
                                        )}
                                        <div style={{ fontSize: 10, fontWeight: 800, color: meta.color, marginTop: 4 }}>
                                            {meta.label.toUpperCase()}
                                        </div>
                                    </div>

                                    {email.expense && (
                                        <Link href="/expenses" className="btn-secondary" style={{ padding: 8, border: "none" }}>
                                            <ArrowUpRight size={16} />
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
