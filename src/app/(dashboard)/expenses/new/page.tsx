"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Property {
    id: string;
    name: string;
}

const CATEGORIES = [
    { value: "UTILITIES", label: "⚡ Utenze" },
    { value: "RENT", label: "🏠 Affitto" },
    { value: "MORTGAGE", label: "🏦 Mutuo" },
    { value: "MAINTENANCE", label: "🔧 Manutenzione" },
    { value: "INSURANCE", label: "🛡️ Assicurazione" },
    { value: "TAX", label: "📋 Tasse" },
    { value: "CONDOMINIUM", label: "🏢 Condominio" },
    { value: "OTHER", label: "📄 Altro" },
];

const FREQUENCIES = [
    { value: "NONE", label: "Una tantum" },
    { value: "MONTHLY", label: "Mensile" },
    { value: "QUARTERLY", label: "Trimestrale" },
    { value: "YEARLY", label: "Annuale" },
];

export default function NewExpensePage() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        propertyId: "",
        category: "UTILITIES",
        description: "",
        amount: "",
        issuedAt: new Date().toISOString().slice(0, 10),
        dueDate: "",
        isPaid: false,
        isRecurring: false,
        frequency: "NONE",
        notes: "",
    });

    useEffect(() => {
        fetch("/api/properties").then((r) => r.json()).then((data) => {
            setProperties(data);
            if (data.length > 0) setForm((f) => ({ ...f, propertyId: data[0].id }));
        });
    }, []);

    function set(field: string, value: string | boolean) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                amount: parseFloat(form.amount),
                dueDate: form.dueDate || undefined,
                description: form.description || undefined,
                notes: form.notes || undefined,
            }),
        });

        const data = await res.json();
        setLoading(false);
        if (res.ok) {
            router.push("/expenses");
        } else {
            setError(data.error || "Errore durante il salvataggio");
        }
    }

    return (
        <div className="form-page">
            <div className="page-header">
                <div>
                    <Link href="/expenses" className="btn-ghost btn-sm" style={{ marginBottom: 8, display: "inline-flex" }}>
                        <ArrowLeft size={14} /> Indietro
                    </Link>
                    <h1 className="page-title">Nuova spesa</h1>
                </div>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit} className="form-section">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Immobile *</label>
                        {properties.length === 0 ? (
                            <div className="auth-error">
                                Prima aggiungi un immobile. <Link href="/properties/new" className="auth-link">Aggiungi qui</Link>
                            </div>
                        ) : (
                            <select className="form-select" value={form.propertyId} onChange={(e) => set("propertyId", e.target.value)} required>
                                {properties.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Categoria</label>
                            <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Importo (€) *</label>
                            <input
                                className="form-input"
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                                placeholder="0,00"
                                value={form.amount}
                                onChange={(e) => set("amount", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descrizione</label>
                        <input
                            className="form-input"
                            placeholder="es. Bolletta Enel Febbraio"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Data emissione</label>
                            <input
                                className="form-input"
                                type="date"
                                value={form.issuedAt}
                                onChange={(e) => set("issuedAt", e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Scadenza</label>
                            <input
                                className="form-input"
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => set("dueDate", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={form.isRecurring}
                                onChange={(e) => set("isRecurring", e.target.checked)}
                                style={{ width: 16, height: 16 }}
                            />
                            <span className="form-label" style={{ marginBottom: 0 }}>Spesa ricorrente</span>
                        </label>
                    </div>

                    {form.isRecurring && (
                        <div className="form-group">
                            <label className="form-label">Frequenza</label>
                            <select className="form-select" value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
                                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={form.isPaid}
                                onChange={(e) => set("isPaid", e.target.checked)}
                                style={{ width: 16, height: 16 }}
                            />
                            <span className="form-label" style={{ marginBottom: 0 }}>Già pagata</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Note</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Note aggiuntive..."
                            value={form.notes}
                            onChange={(e) => set("notes", e.target.value)}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={loading || properties.length === 0}>
                            {loading ? "Salvataggio..." : "Salva spesa"}
                        </button>
                        <Link href="/expenses" className="btn-secondary">Annulla</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
