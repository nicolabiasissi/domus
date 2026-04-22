"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, MapPin, Notebook, Upload, Camera, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [type, setType] = useState<"OWNED" | "RENTED">("OWNED");
    const [notes, setNotes] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`/api/properties`);
            if (res.ok) {
                const list = await res.json();
                const item = list.find((p: any) => p.id === id);
                if (item) {
                    setName(item.name);
                    setAddress(item.address || "");
                    setType(item.type);
                    setNotes(item.notes || "");
                    setImageUrl(item.imageUrl);
                }
            }
            setLoading(false);
        };
        load();
    }, [id]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (res.ok) {
                const { url } = await res.json();
                setImageUrl(url);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/properties/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, address, type, notes, imageUrl }),
            });
            if (res.ok) router.push("/properties");
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Sei sicuro di voler eliminare questo immobile?")) return;
        const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
        if (res.ok) router.push("/properties");
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="animate-gentle">
            <Link href="/properties" className="back-link" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 700, marginBottom: 32 }}>
                <ArrowLeft size={16} />
                Torna agli Immobili
            </Link>

            <header style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="kpi-main-label">Gestione Asset</div>
                    <h1 className="page-title" style={{ fontSize: 40 }}>Modifica Immobile</h1>
                </div>
                <button onClick={handleDelete} className="btn-secondary" style={{ color: "var(--danger)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                    <Trash2 size={16} style={{ marginRight: 8 }} />
                    Elimina Immobile
                </button>
            </header>

            <form onSubmit={handleSubmit} className="card" style={{ padding: 40 }}>
                {/* Image Upload Area */}
                <div style={{ marginBottom: 48 }}>
                    <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 16, display: "block" }}>
                        Foto Immobile
                    </label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            width: "100%", height: 300, borderRadius: 24, background: "var(--muted-bg)",
                            border: "2px dashed var(--card-border)", display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative"
                        }}
                    >
                        {imageUrl ? (
                            <img src={imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <div style={{ textAlign: "center" }}>
                                <Camera size={48} className="text-muted" style={{ marginBottom: 16 }} />
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>
                                    {uploading ? "Caricamento..." : "Clicca per caricare una foto"}
                                </div>
                            </div>
                        )}
                        {uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" /></div>}
                    </div>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleUpload} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
                    <div className="form-group">
                        <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                            Nome Immobile
                        </label>
                        <div style={{ position: "relative" }}>
                            <Home size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                            <input
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Esempio: Villa Marina"
                                style={{ width: "100%", paddingLeft: 48 }}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                            Tipo Proprietà
                        </label>
                        <select
                            className="form-input"
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            style={{ width: "100%" }}
                        >
                            <option value="OWNED">In Proprietà</option>
                            <option value="RENTED">In Affitto</option>
                        </select>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 32 }}>
                    <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                        Indirizzo Completo
                    </label>
                    <div style={{ position: "relative" }}>
                        <MapPin size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                        <input
                            className="form-input"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Via Roma 123, Milano"
                            style={{ width: "100%", paddingLeft: 48 }}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 48 }}>
                    <label className="form-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                        Note e Dettagli
                    </label>
                    <div style={{ position: "relative" }}>
                        <Notebook size={18} style={{ position: "absolute", left: 16, top: 20, color: "var(--muted)" }} />
                        <textarea
                            className="form-input"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Inserisci dettagli aggiuntivi..."
                            style={{ width: "100%", paddingLeft: 48, paddingTop: 16, resize: "none" }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" className="btn-primary" disabled={saving || uploading} style={{ padding: "16px 48px", fontSize: 14, fontWeight: 700 }}>
                        {saving ? "Salvataggio..." : "Aggiorna Immobile"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
