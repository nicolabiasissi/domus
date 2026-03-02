"use client";

import { useEffect, useState } from "react";
import { Mail, Zap, Unlink, X } from "lucide-react";

interface UserAccount {
    email: string;
    plan: "FREE" | "PRO";
    emailConnection: {
        id: string;
        email: string;
        provider: string;
        isActive: boolean;
        lastSyncAt: string | null;
    } | null;
}

export default function AccountPage() {
    const [account, setAccount] = useState<UserAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [showImapModal, setShowImapModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        host: "imap.gmail.com",
        port: "993",
        secure: true
    });

    useEffect(() => {
        const loadAccount = async () => {
            try {
                const res = await fetch("/api/settings");
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const text = await res.text();
                if (text) {
                    setAccount(JSON.parse(text));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadAccount();
    }, []);

    const handleDisconnect = async () => {
        if (!confirm("Sei sicuro di voler disconnettere la tua email?")) return;
        await fetch("/api/email-connection", { method: "DELETE" });
        setAccount(a => a ? { ...a, emailConnection: null } : a);
    };

    const handleImapSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/email-connection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, provider: "IMAP" })
        });
        if (res.ok) {
            const conn = await res.json();
            setAccount(a => a ? { ...a, emailConnection: conn } : a);
            setShowImapModal(false);
        }
        setLoading(false);
    };

    if (loading && !showImapModal) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Account</h1>
                    <p className="page-subtitle">Piano, email e abbonamento</p>
                </div>
            </div>

            <div className="settings-section-stack">
                {/* Plan */}
                <div className="settings-panel">
                    <div className="settings-panel-title">Piano attivo</div>
                    <div className="plan-card" style={{ padding: 24, borderRadius: 16 }}>
                        <div className="plan-card-left">
                            <div className={`plan-badge ${account?.plan === "PRO" ? "plan-badge-pro" : "plan-badge-free"}`}>
                                {account?.plan === "PRO" ? "⚡ PRO" : "FREE"}
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 16 }}>
                                    {account?.plan === "PRO" ? "Piano Pro" : "Piano Gratuito"}
                                </p>
                                <p className="form-hint" style={{ marginTop: 4 }}>
                                    {account?.plan === "PRO"
                                        ? "Immobili illimitati, AI email ingestion, statistiche complete"
                                        : "1 immobile, inserimento manuale spese, dashboard base"}
                                </p>
                            </div>
                        </div>
                        {account?.plan === "FREE" && (
                            <button className="btn-primary">
                                <Zap size={14} /> Passa a Pro
                            </button>
                        )}
                    </div>
                </div>

                {/* Email Connection */}
                <div className="settings-panel">
                    <div className="settings-panel-title">Connessione email</div>
                    {account?.emailConnection ? (
                        <div className="connection-card" style={{ padding: 20, borderRadius: 16, border: "1px solid var(--card-border)" }}>
                            <div className="connection-icon" style={{ background: "var(--primary-light)", color: "var(--primary)", padding: 12, borderRadius: 12 }}>
                                <Mail size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, fontSize: 16 }}>{account.emailConnection.email}</p>
                                <p className="form-hint" style={{ marginTop: 2 }}>
                                    Provider: {account.emailConnection.provider} ·
                                    <span style={{ color: "var(--success)" }}> ✓ Attivo</span>
                                    {account.emailConnection.lastSyncAt &&
                                        ` · Ultima sync: ${new Date(account.emailConnection.lastSyncAt).toLocaleDateString("it-IT")}`}
                                </p>
                            </div>
                            <button className="btn-secondary" onClick={handleDisconnect} style={{ color: "var(--danger)" }}>
                                <Unlink size={16} /> Disconnetti
                            </button>
                        </div>
                    ) : (
                        <div className="identity-upload-area" style={{ padding: 40, border: "2px dashed var(--card-border)", borderRadius: 20, textAlign: "center" }}>
                            <span style={{ fontSize: 40 }}>📧</span>
                            <p style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>Nessuna email connessa</p>
                            <p className="form-hint" style={{ marginTop: 4 }}>Configura la tua casella per abilitare il rilevamento AI delle bollette.</p>
                            <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "center" }}>
                                <button className="btn-primary" onClick={() => setShowImapModal(true)}>
                                    Configura IMAP
                                </button>
                                <button className="btn-secondary" disabled>
                                    Connetti Gmail (Prossimamente)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* IMAP Modal */}
            {showImapModal && (
                <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div className="premium-card" style={{ width: "100%", maxWidth: 450, padding: 32, borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 800 }}>Configura IMAP</h2>
                            <button className="btn-ghost" onClick={() => setShowImapModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleImapSubmit} className="form-section">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password applicazione</label>
                                <input className="form-input" type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                <p className="form-hint">Usa una password specifica per le app o la password della tua email.</p>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Host IMAP</label>
                                    <input className="form-input" required value={formData.host} onChange={e => setFormData({ ...formData, host: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ maxWidth: 100 }}>
                                    <label className="form-label">Porta</label>
                                    <input className="form-input" required value={formData.port} onChange={e => setFormData({ ...formData, port: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-actions" style={{ marginTop: 40 }}>
                                <button type="submit" className="btn-primary" style={{ width: "100%", padding: 14 }}>
                                    Connetti account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
