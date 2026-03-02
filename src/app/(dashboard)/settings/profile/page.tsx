"use client";

import { useState, useEffect, useRef } from "react";
import { User, Camera, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface UserSettings {
    name: string | null;
    email: string;
    avatarUrl: string | null;
    identityDocs: { id: string; status: string; extractedName: string | null; extractedAddress: string | null; createdAt: string }[];
}

export default function ProfileSettingsPage() {
    const [user, setUser] = useState<UserSettings | null>(null);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetch("/api/settings");
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const text = await res.text();
                if (text) {
                    const data = JSON.parse(text);
                    setUser(data);
                    setName(data.name || "");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/identity-docs", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            // Refresh documents
            const updated = await fetch("/api/settings").then(r => r.json());
            setUser(updated);
        }
        setUploading(false);
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    const latestDoc = user?.identityDocs?.[0];

    return (
        <div className="dashboard-fade-in">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 28 }}>Profilo</h1>
                    <p className="page-subtitle">Gestisci le tue informazioni e verifica il tuo account.</p>
                </div>
            </div>

            <div className="settings-section-stack">
                {/* Avatar */}
                <div className="settings-panel premium-card">
                    <div className="settings-panel-title">Foto profilo</div>
                    <div className="settings-avatar-row" style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <div className="settings-avatar" style={{ width: 80, height: 80, borderRadius: 24, fontSize: 32, background: "var(--muted-bg)" }}>
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 24 }} />
                            ) : (
                                <User size={32} />
                            )}
                        </div>
                        <div>
                            <button className="btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10 }}>
                                <Camera size={14} /> Cambia foto
                            </button>
                            <p className="form-hint" style={{ marginTop: 8 }}>Consigliato: 400x400px. JPG o PNG.</p>
                        </div>
                    </div>
                </div>

                {/* Name & Email */}
                <div className="settings-panel premium-card">
                    <div className="settings-panel-title">Informazioni personali</div>
                    <form onSubmit={handleSave} className="form-section">
                        <div className="form-row" style={{ gap: 24 }}>
                            <div className="form-group">
                                <label className="form-label">Nome completo</label>
                                <input
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Il tuo nome"
                                    style={{ borderRadius: 12 }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" value={user?.email || ""} disabled style={{ opacity: 0.5, borderRadius: 12, background: "var(--muted-bg)" }} />
                            </div>
                        </div>
                        <div className="form-actions" style={{ marginTop: 24 }}>
                            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "10px 24px", borderRadius: 12 }}>
                                {saving ? "Salvataggio..." : saved ? "✓ Salvato!" : "Salva modifiche"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Identity Document */}
                <div className="settings-panel premium-card">
                    <div className="settings-panel-title">Verifica Identità</div>
                    <p className="form-hint" style={{ marginBottom: 20 }}>
                        Carica una bolletta recente intestata a te per confermare l&apos;indirizzo e sbloccare l&apos;automazione AI.
                    </p>

                    {latestDoc ? (
                        <div style={{ background: "var(--muted-bg)", padding: 20, borderRadius: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {latestDoc.status === "VERIFIED" ? <CheckCircle size={18} style={{ color: "var(--success)" }} /> : <AlertCircle size={18} style={{ color: "var(--warning)" }} />}
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                                        {latestDoc.status === "VERIFIED" ? "Documento Verificato" : "Verifica in corso..."}
                                    </span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.5 }}>{new Date(latestDoc.createdAt).toLocaleDateString("it-IT")}</span>
                            </div>
                            {latestDoc.extractedName && (
                                <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div style={{ opacity: 0.6 }}>Intestatario rilevato:</div>
                                    <div style={{ fontWeight: 600 }}>{latestDoc.extractedName}</div>
                                    <div style={{ opacity: 0.6, marginTop: 4 }}>Indirizzo:</div>
                                    <div style={{ fontWeight: 600 }}>{latestDoc.extractedAddress}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="identity-upload-area"
                            style={{ padding: 40, border: "2px dashed var(--card-border)", borderRadius: 20, textAlign: "center", cursor: "pointer" }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} hidden accept="application/pdf" onChange={handleUpload} />
                            <div style={{ background: "var(--primary-light)", color: "var(--primary)", width: 56, height: 56, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                <Upload size={24} />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 16 }}>{uploading ? "Caricamento..." : "Carica bolletta PDF"}</p>
                            <p className="form-hint" style={{ marginTop: 4 }}>Trascina qui il file o clicca per selezionarlo</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
