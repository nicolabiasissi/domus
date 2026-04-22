"use client";

import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Check, Shield, Globe, Landmark } from "lucide-react";

const themeOptions = [
    { value: "LIGHT", label: "Giorno" },
    { value: "DARK", label: "Notte" },
    { value: "AUTO", label: "Sistema" },
];

const currencyOptions = [
    { value: "EUR", label: "EUR (€)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
];

export default function PreferencesPage() {
    const { user, updatePreferences, loading } = useAppContext();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    if (loading || !user) return null;

    const setPref = async (data: any) => {
        setSaving(true);
        setError(null);
        try {
            await updatePreferences(data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            setError(err?.message || "Errore nel salvataggio");
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-gentle">
            <header style={{ marginBottom: 48 }}>
                <div className="kpi-main-label">Personalizzazione</div>
                <h1 className="page-title" style={{ fontSize: 40 }}>Preferenze</h1>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
                {/* Theme Section */}
                <section>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                        <Shield size={18} className="text-muted" />
                        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Interfaccia</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        {themeOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setPref({ theme: opt.value })}
                                className={user.theme === opt.value ? "sidebar-link-active" : "card"}
                                style={{
                                    padding: 24, border: "none", cursor: "pointer",
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                                    borderRadius: 12, transition: "0.2s"
                                }}
                            >
                                <span style={{ fontSize: 14, fontWeight: 700 }}>{opt.label}</span>
                                {user.theme === opt.value && <div style={{ width: 4, height: 4, background: "var(--foreground)", borderRadius: "50%" }} />}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Localization Section */}
                <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                    <div className="card">
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <Globe size={16} className="text-muted" />
                            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Localizzazione</h3>
                        </div>
                        <select
                            className="btn-secondary"
                            style={{ width: "100%", textAlign: "left", background: "var(--background)", border: "1px solid var(--card-border)" }}
                            value={user.language}
                            onChange={(e) => setPref({ language: e.target.value })}
                        >
                            <option value="it">Italiano (IT)</option>
                            <option value="en">English (UK)</option>
                            <option value="fr">Français (FR)</option>
                            <option value="es">Español (ES)</option>
                            <option value="de">Deutsch (DE)</option>
                        </select>
                    </div>

                    <div className="card">
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <Landmark size={16} className="text-muted" />
                            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Valuta Predefinita</h3>
                        </div>
                        <select
                            className="btn-secondary"
                            style={{ width: "100%", textAlign: "left", background: "var(--background)", border: "1px solid var(--card-border)" }}
                            value={user.currency}
                            onChange={(e) => setPref({ currency: e.target.value })}
                        >
                            {currencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </section>

                {/* Notifications Section */}
                <section>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Notifiche</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                            { key: "notifyEmail", label: "Notifiche via email" },
                            { key: "notifyPush", label: "Notifiche push" }
                        ].map(({ key, label }) => (
                            <div key={key} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                                <input
                                    type="checkbox"
                                    checked={(user as any)[key]}
                                    onChange={(e) => setPref({ [key]: e.target.checked })}
                                    style={{ width: 40, height: 20, cursor: "pointer" }}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <footer style={{ borderTop: "1px solid var(--card-border)", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: error ? "var(--danger)" : saved ? "var(--success)" : "var(--muted)" }}>
                        {saving ? "Salvataggio..." : error ? error : saved ? "✓ Preferenze salvate" : "Preferenze sincronizzate con il cloud Domus."}
                    </div>
                </footer>
            </div>
        </motion.div>
    );
}
