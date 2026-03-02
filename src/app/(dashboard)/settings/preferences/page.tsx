"use client";

import { useState, useEffect } from "react";

interface Prefs {
    theme: "LIGHT" | "DARK" | "AUTO";
    language: string;
    currency: string;
    notifyEmail: boolean;
    notifyPush: boolean;
}

const themeOptions = [
    { value: "LIGHT", label: "☀️ Chiaro" },
    { value: "DARK", label: "🌙 Scuro" },
    { value: "AUTO", label: "⚙️ Automatico" },
];

const currencyOptions = [
    { value: "EUR", label: "€ Euro" },
    { value: "USD", label: "$ Dollaro" },
    { value: "GBP", label: "£ Sterlina" },
    { value: "CHF", label: "₣ Franco svizzero" },
];

const languageOptions = [
    { value: "it", label: "🇮🇹 Italiano" },
    { value: "en", label: "🇬🇧 English" },
];

export default function PreferencesPage() {
    const [prefs, setPrefs] = useState<Prefs>({ theme: "AUTO", language: "it", currency: "EUR", notifyEmail: true, notifyPush: true });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then((data) => {
                setPrefs({ theme: data.theme, language: data.language, currency: data.currency, notifyEmail: data.notifyEmail, notifyPush: data.notifyPush });
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prefs),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Preferenze</h1>
                    <p className="page-subtitle">Personalizza la tua esperienza</p>
                </div>
            </div>
            <form onSubmit={handleSave} className="settings-section-stack">
                <div className="settings-panel">
                    <div className="settings-panel-title">Aspetto e lingua</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Tema</label>
                            <div className="theme-picker">
                                {themeOptions.map(({ value, label }) => (
                                    <button
                                        type="button"
                                        key={value}
                                        className={`theme-option ${prefs.theme === value ? "theme-option-active" : ""}`}
                                        onClick={() => setPrefs(p => ({ ...p, theme: value as Prefs["theme"] }))}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Lingua</label>
                            <select className="form-select" value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}>
                                {languageOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: 16 }}>
                        <label className="form-label">Valuta</label>
                        <select className="form-select" value={prefs.currency} onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))}>
                            {currencyOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="settings-panel">
                    <div className="settings-panel-title">Notifiche</div>
                    <div className="settings-toggle-row">
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>Notifiche email</div>
                            <p className="form-hint">Ricevi aggiornamenti e promemoria via email</p>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" checked={prefs.notifyEmail} onChange={e => setPrefs(p => ({ ...p, notifyEmail: e.target.checked }))} />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                    <div className="settings-toggle-row">
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>Notifiche push</div>
                            <p className="form-hint">Notifiche nel browser per nuove bollette rilevate</p>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" checked={prefs.notifyPush} onChange={e => setPrefs(p => ({ ...p, notifyPush: e.target.checked }))} />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? "Salvataggio..." : saved ? "✓ Salvato!" : "Salva preferenze"}
                    </button>
                </div>
            </form>
        </div>
    );
}
