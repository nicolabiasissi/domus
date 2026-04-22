"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-gentle">
            <header style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <Link href="/expenses" className="text-muted" style={{ fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <ArrowLeft size={14} /> Contabilità
                    </Link>
                    <h1 className="page-title" style={{ fontSize: 40 }}>Nuovo Flusso</h1>
                </div>
            </header>

            <div className="card" style={{ maxWidth: 800 }}>
                <form onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Sede di Riferimento</label>
                        {properties.length === 0 ? (
                            <div className="auth-error" style={{ marginBottom: 0 }}>
                                Nessuna sede configurata. <Link href="/properties/new" style={{ color: "inherit" }}>Aggiungi ora</Link>
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
                            <label className="form-label">Categoria di Spesa</label>
                            <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Importo Nominale</label>
                            <input
                                className="form-input"
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => set("amount", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descrizione Breve</label>
                        <input
                            className="form-input"
                            placeholder="es. Fattura Vodafone"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Data Emissione</label>
                            <input
                                className="form-input"
                                type="date"
                                value={form.issuedAt}
                                onChange={(e) => set("issuedAt", e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Data Scadenza Pagamento</label>
                            <input
                                className="form-input"
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => set("dueDate", e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, margin: "24px 0" }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={form.isRecurring}
                                    onChange={(e) => set("isRecurring", e.target.checked)}
                                    style={{ width: 14, height: 14 }}
                                />
                                <span className="form-label" style={{ marginBottom: 0 }}>Flusso Ricorrente</span>
                            </label>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={form.isPaid}
                                    onChange={(e) => set("isPaid", e.target.checked)}
                                    style={{ width: 14, height: 14 }}
                                />
                                <span className="form-label" style={{ marginBottom: 0 }}>Saldata</span>
                            </label>
                        </div>
                    </div>

                    {form.isRecurring && (
                        <div className="form-group">
                            <label className="form-label">Ciclo di Ricorrenza</label>
                            <select className="form-select" value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
                                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 16, marginTop: 40, borderTop: "1px solid var(--card-border)", paddingTop: 32 }}>
                        <button type="submit" className="btn-primary" disabled={loading || properties.length === 0} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Save size={16} />
                            {loading ? "Registrazione..." : "Registra Voce"}
                        </button>
                        <Link href="/expenses" className="btn-secondary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                            <X size={16} />
                            Annulla
                        </Link>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
