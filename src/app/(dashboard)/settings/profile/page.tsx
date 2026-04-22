"use client";

import { useState, useEffect, useRef } from "react";
import { User, Camera, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";

interface UserSettings {
    name: string | null;
    email: string;
    avatarUrl: string | null;
    identityDocs: { id: string; status: string; extractedName: string | null; extractedAddress: string | null; createdAt: string }[];
}

type Gender = "MALE" | "FEMALE" | "NEUTRAL";

export default function ProfileSettingsPage() {
    const { user, updateProfile, loading } = useAppContext();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState<Gender>("NEUTRAL");
    const [birthdate, setBirthdate] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setGender(user.gender || "NEUTRAL");
            if (user.birthdate) {
                setBirthdate(new Date(user.birthdate).toISOString().split("T")[0]);
            }
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await updateProfile({
                firstName,
                lastName,
                gender,
                birthdate: birthdate ? new Date(birthdate).toISOString() : null
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            setError(err?.message || "Errore durante il salvataggio");
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Caricamento immagine fallito");
            }
            const { url } = await res.json();
            await updateProfile({ avatarUrl: url });
        } catch (err: any) {
            setError(err?.message || "Errore durante il caricamento");
        } finally {
            setUploading(false);
        }
    };

    if (loading || !user) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-gentle">
            <header style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div className="kpi-main-label">Identità Account</div>
                    <h1 className="page-title" style={{ fontSize: 40 }}>Il Tuo Profilo</h1>
                    <p className="page-subtitle" style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
                        Gestisci le informazioni personali e la tua presenza sulla piattaforma.
                    </p>
                </div>

                {user.identityDocs?.[0] ? (
                    <div className={`badge ${user.identityDocs[0].status === "VERIFIED" ? "badge-paid" : user.identityDocs[0].status === "FAILED" ? "badge-overdue" : "badge-upcoming"}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
                        {user.identityDocs[0].status === "VERIFIED" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        <span>Identità {user.identityDocs[0].status === "VERIFIED" ? "Verificata" : user.identityDocs[0].status === "FAILED" ? "Rifiutata" : "In Revisione"}</span>
                    </div>
                ) : (
                    <div className="badge" style={{ background: "var(--muted-bg)", color: "var(--muted)", display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
                        <AlertCircle size={14} />
                        <span>Identità non verificata</span>
                    </div>
                )}
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {/* Avatar Section */}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 32, padding: 32 }}>
                    <div style={{ position: "relative" }}>
                        <div style={{ width: 100, height: 100, borderRadius: 32, background: "var(--muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <User size={40} className="text-muted" />
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{ position: "absolute", bottom: -8, right: -8, width: 36, height: 36, borderRadius: 12, background: "var(--background)", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--foreground)" }}
                        >
                            <Camera size={16} />
                        </button>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleUpload} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Foto Profilo</h3>
                        <p style={{ fontSize: 13, color: "var(--muted)" }}>
                            {uploading ? "Caricamento in corso..." : "L'immagine è salvata in modo permanente sul server."}
                        </p>
                    </div>
                </div>

                {/* Info Form */}
                {error && (
                    <div className="auth-error" style={{ marginBottom: 0 }}>{error}</div>
                )}
                <div className="card" style={{ padding: 40 }}>
                    <form onSubmit={handleSave}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                                    Nome
                                </label>
                                <input
                                    className="form-input"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Es. Nicola"
                                    style={{ width: "100%", background: "var(--background)" }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                                    Cognome
                                </label>
                                <input
                                    className="form-input"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Es. Rossi"
                                    style={{ width: "100%", background: "var(--background)" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                                    Genere
                                </label>
                                <select
                                    className="form-input"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as Gender)}
                                    style={{ width: "100%", background: "var(--background)" }}
                                >
                                    <option value="MALE">Uomo</option>
                                    <option value="FEMALE">Donna</option>
                                    <option value="NEUTRAL">Neutro / Altro</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                                    Data di Nascita
                                </label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={birthdate}
                                    onChange={(e) => setBirthdate(e.target.value)}
                                    style={{ width: "100%", background: "var(--background)" }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 40 }}>
                            <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                                Indirizzo Email (Sola Lettura)
                            </label>
                            <div style={{ padding: "12px 16px", background: "var(--muted-bg)", borderRadius: 8, fontSize: 14, color: "var(--muted)", cursor: "not-allowed" }}>
                                {user.email}
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "12px 32px", fontSize: 14, fontWeight: 700 }}>
                                {saving ? "Salvataggio..." : saved ? "Modifiche Salvate" : "Salva Profilo"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
