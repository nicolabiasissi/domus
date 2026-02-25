"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPropertyPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", address: "", type: "OWNED", notes: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
        <div className="form-page">
            <div className="page-header">
                <div>
                    <Link href="/properties" className="btn-ghost btn-sm" style={{ marginBottom: 8, display: "inline-flex" }}>
                        <ArrowLeft size={14} /> Indietro
                    </Link>
                    <h1 className="page-title">Nuovo immobile</h1>
                </div>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit} className="form-section">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Nome immobile *</label>
                        <input
                            className="form-input"
                            required
                            placeholder="es. Casa Milano, Appartamento Roma"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Indirizzo</label>
                        <input
                            className="form-input"
                            placeholder="Via Roma 1, Milano"
                            value={form.address}
                            onChange={(e) => set("address", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tipo</label>
                        <select
                            className="form-select"
                            value={form.type}
                            onChange={(e) => set("type", e.target.value)}
                        >
                            <option value="OWNED">Proprietà</option>
                            <option value="RENTED">Affitto</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Note</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Informazioni aggiuntive sull'immobile..."
                            value={form.notes}
                            onChange={(e) => set("notes", e.target.value)}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Salvataggio..." : "Salva immobile"}
                        </button>
                        <Link href="/properties" className="btn-secondary">
                            Annulla
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
