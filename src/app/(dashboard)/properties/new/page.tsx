"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X, Camera } from "lucide-react";
import { motion } from "framer-motion";

export default function NewPropertyPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", address: "", type: "OWNED", imageUrl: "", notes: "" });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const { url } = await res.json();
                setForm(prev => ({ ...prev, imageUrl: url }));
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    function set(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, address: form.address || undefined, notes: form.notes || undefined }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            router.push("/properties");
        } else {
            setError(data.error || "Errore durante il salvataggio");
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-gentle">
            <header style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <Link href="/properties" className="text-muted" style={{ fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <ArrowLeft size={14} /> Torna agli immobili
                    </Link>
                    <h1 className="page-title" style={{ fontSize: 40 }}>Nuova Sede</h1>
                </div>
            </header>

            <div className="card" style={{ maxWidth: 640 }}>
                <form onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

                    <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 24 }}>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: 120, height: 120, borderRadius: 16, background: "var(--muted-bg)",
                                border: "1px dashed var(--card-border)", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", position: "relative"
                            }}
                        >
                            {form.imageUrl ? (
                                <img src={form.imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <div style={{ textAlign: "center", color: "var(--muted)" }}>
                                    <Camera size={24} style={{ marginBottom: 4 }} />
                                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Upload</div>
                                </div>
                            )}
                            {uploading && <div className="loading-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner-sm" /></div>}
                        </div>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleUpload} />
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Foto Immobile</h3>
                            <p style={{ fontSize: 13, color: "var(--muted)" }}>Carica una foto rappresentativa dell'immobile.</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Denominazione</label>
                        <input
                            className="form-input"
                            required
                            placeholder="es. Residenza Principale"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Indirizzo Completo</label>
                        <input
                            className="form-input"
                            placeholder="Via, Civico, Città"
                            value={form.address}
                            onChange={(e) => set("address", e.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Regime</label>
                            <select
                                className="form-select"
                                value={form.type}
                                onChange={(e) => set("type", e.target.value)}
                            >
                                <option value="OWNED">Proprietà</option>
                                <option value="RENTED">Locazione</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Appunti Interni</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Inserisci dettagli aggiuntivi..."
                            value={form.notes}
                            onChange={(e) => set("notes", e.target.value)}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 16, marginTop: 40, borderTop: "1px solid var(--card-border)", paddingTop: 32 }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Save size={16} />
                            {loading ? "Salvataggio..." : "Archivia immobile"}
                        </button>
                        <Link href="/properties" className="btn-secondary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                            <X size={16} />
                            Annulla
                        </Link>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
