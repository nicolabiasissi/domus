"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Building2, Trash2, MapPin, Receipt } from "lucide-react";

interface Property {
    id: string;
    name: string;
    address: string | null;
    type: "OWNED" | "RENTED";
    notes: string | null;
    _count: { expenses: number };
}

const typeLabel = { OWNED: "Proprietà", RENTED: "Affitto" };

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/properties");
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const text = await res.text();
            if (text) {
                setProperties(JSON.parse(text));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function deleteProperty(id: string) {
        if (!confirm("Eliminare questo immobile e tutte le sue spese?")) return;
        await fetch(`/api/properties/${id}`, { method: "DELETE" });
        setProperties((prev) => prev.filter((p) => p.id !== id));
    }

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <div className="dashboard-fade-in">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 28, letterSpacing: "-0.5px" }}>I tuoi immobili</h1>
                    <p className="page-subtitle">Gestisci le tue proprietà e attiva il monitoraggio spese.</p>
                </div>
                <Link href="/properties/new" className="btn-primary" style={{ borderRadius: 99 }}>
                    <Plus size={18} />
                    Aggiungi immobile
                </Link>
            </div>

            {properties.length === 0 ? (
                <div className="empty-state-card">
                    <div className="empty-icon">🏠</div>
                    <p className="empty-title">Nessun immobile configurato</p>
                    <p className="empty-sub">Aggiungi la tua prima casa per analizzare automaticamente le bollette.</p>
                    <Link href="/properties/new" className="btn-primary" style={{ borderRadius: 99, marginTop: 12 }}>
                        Configura ora
                    </Link>
                </div>
            ) : (
                <div className="properties-grid" style={{ gap: 24 }}>
                    {properties.map((p) => (
                        <div key={p.id} className="property-card premium-card" style={{ padding: 24, borderRadius: 20 }}>
                            <div className="property-card-top" style={{ marginBottom: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div className="property-name" style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</div>
                                    {p.address && (
                                        <div className="property-address" style={{ marginTop: 4 }}>
                                            <MapPin size={13} style={{ display: "inline", marginRight: 6, color: "var(--primary)" }} />
                                            {p.address}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteProperty(p.id)}
                                    className="btn-ghost"
                                    style={{ color: "var(--danger)", padding: 8 }}
                                    title="Elimina"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="property-meta" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                                <div style={{ background: "var(--muted-bg)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                                    {typeLabel[p.type]}
                                </div>
                                <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                                    {p._count.expenses} spese rilevate
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 10 }}>
                                <Link
                                    href={`/expenses?propertyId=${p.id}`}
                                    className="btn-secondary"
                                    style={{ flex: 1, borderRadius: 99, fontSize: 13 }}
                                >
                                    <Receipt size={14} />
                                    Vedi spese
                                </Link>
                                <Link
                                    href="/inbox"
                                    className="btn-ghost"
                                    style={{ borderRadius: 99, fontSize: 13, background: "var(--muted-bg)" }}
                                >
                                    Fornitori AI
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
