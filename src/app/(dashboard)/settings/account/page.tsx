"use client";

import { useState } from "react";
import { Mail, Zap, Unlink, X, ShieldCheck, Sparkles, Infinity, BarChart3, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";

const proFeatures = [
    { icon: Sparkles, label: "AI Inbox Avanzato", desc: "Rilevamento automatico e parsing intelligente delle bollette." },
    { icon: Infinity, label: "Immobili Illimitati", desc: "Gestisci tutti i tuoi asset senza alcun limite quantitativo." },
    { icon: BarChart3, label: "Analytics Premium", desc: "Proiezioni di spesa e reportistica fiscale dettagliata." },
    { icon: Clock, label: "Priorità Supporto", desc: "Risposte garantite dal nostro team in meno di 2 ore." },
];

export default function AccountPage() {
    const { user, loading } = useAppContext();
    const [showImapModal, setShowImapModal] = useState(false);

    if (loading || !user) return <div className="loading-center"><div className="spinner" /></div>;

    const isPro = user.plan === "PRO";

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-gentle">
            <header style={{ marginBottom: 48 }}>
                <div className="kpi-main-label">Gestione Account</div>
                <h1 className="page-title" style={{ fontSize: 40 }}>Abbonamento</h1>
                <p className="page-subtitle" style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
                    Controlla il tuo piano attuale e scopri le funzionalità avanzate per la gestione immobiliare.
                </p>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
                {/* Current Plan Section */}
                <div className="card" style={{ padding: 40, background: isPro ? "rgba(255,185,56,0.03)" : "var(--card)", border: isPro ? "1px solid rgba(255,185,56,0.2)" : "1px solid var(--card-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                        <div>
                            <div style={{
                                display: "inline-flex", padding: "4px 12px", borderRadius: 20,
                                background: isPro ? "var(--warning-bg)" : "var(--muted-bg)",
                                color: isPro ? "var(--warning)" : "var(--muted)",
                                fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 16
                            }}>
                                {isPro ? "PIANO PROFESSIONALE" : "PIANO BASE"}
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 800 }}>{isPro ? "Domus Pro" : "Domus Basic"}</h2>
                            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
                                {isPro ? "Hai accesso illimitato a tutta la potenza dell'AI di Domus." : "Il set di strumenti essenziale per iniziare la gestione dei tuoi immobili."}
                            </p>
                        </div>
                        {!isPro && (
                            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px" }}>
                                <Zap size={16} fill="currentColor" /> Upgrade a Pro
                            </button>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <ShieldCheck size={20} style={{ color: "var(--success)" }} />
                            <span style={{ fontSize: 14, fontWeight: 500 }}>Fatturazione Mensile attiva</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Mail size={20} style={{ color: "var(--muted)" }} />
                            <span style={{ fontSize: 14, fontWeight: 500 }}>Inviata a: {user.email}</span>
                        </div>
                    </div>
                </div>

                {/* Features Comparison */}
                {!isPro && (
                    <section>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Sblocca il potenziale di Domus Pro</h3>
                        <div className="settings-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                            {proFeatures.map((f, i) => (
                                <div key={i} className="card" style={{ padding: 24, display: "flex", gap: 20 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--warning)" }}>
                                        <f.icon size={22} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{f.label}</h4>
                                        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Account Details / Danger Zone */}
                <section>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Dettagli Account</h3>
                    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px" }}>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700 }}>Stato dell'account</p>
                            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Il tuo account è in regola e sincronizzato correttamente.</p>
                        </div>
                        <button className="btn-secondary" style={{ color: "var(--danger)", background: "rgba(255,77,77,0.05)" }}>
                            Elimina Account
                        </button>
                    </div>
                </section>
            </div>
        </motion.div>
    );
}
