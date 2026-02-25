"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Building2, Trash2, MapPin } from "lucide-react";

interface Property {
    id: string;
    name: string;
    address: string | null;
    type: "OWNED" | "RENTED";
    notes: string | null;
    _count: { expenses: number };
}

const typeLabel = { OWNED: "Proprietà", RENTED: "Affitto" };
const typeBadge = { OWNED: "badge-primary", RENTED: "badge-muted" };

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        const res = await fetch("/api/properties");
        if (res.ok) setProperties(await res.json());
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function deleteProperty(id: string) {
        if (!confirm("Eliminare questo immobile e tutte le sue spese?")) return;
        await fetch(`/api/properties/${id}`, { method: "DELETE" });
        setProperties((prev) => prev.filter((p) => p.id !== id));
    }

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">I tuoi immobili</h1>
                    <p className="page-subtitle">{properties.length} immobile{properties.length !== 1 ? "i" : ""} registrat{properties.length !== 1 ? "i" : "o"}</p>
                </div>
                <Link href="/properties/new" className="btn-primary">
                    <Plus size={16} />
                    Aggiungi immobile
                </Link>
            </div>

            {properties.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏠</div>
                    <p className="empty-title">Nessun immobile ancora</p>
                    <p className="empty-sub">Aggiungi il tuo primo immobile per iniziare a tracciare le spese</p>
                    <Link href="/properties/new" className="btn-primary">
                        <Plus size={16} />
                        Aggiungi immobile
                    </Link>
                </div>
            ) : (
                <div className="properties-grid">
                    {properties.map((p) => (
                        <div key={p.id} className="property-card">
                            <div className="property-card-top">
                                <div style={{ flex: 1 }}>
                                    <div className="property-name">{p.name}</div>
                                    {p.address && (
                                        <div className="property-address">
                                            <MapPin size={12} style={{ display: "inline", marginRight: 4 }} />
                                            {p.address}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteProperty(p.id)}
                                    className="btn-danger btn-sm"
                                    title="Elimina"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="property-meta">
                                <span className={`badge ${typeBadge[p.type]}`}>
                                    <Building2 size={10} />
                                    {typeLabel[p.type]}
                                </span>
                                <span className="badge badge-muted">
                                    {p._count.expenses} spe{p._count.expenses !== 1 ? "se" : "sa"}
                                </span>
                            </div>
                            <Link
                                href={`/expenses?propertyId=${p.id}`}
                                className="btn-secondary btn-sm"
                                style={{ width: "100%", justifyContent: "center" }}
                            >
                                Vedi spese
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
