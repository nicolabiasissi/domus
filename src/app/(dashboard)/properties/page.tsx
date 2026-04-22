"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2, MapPin, Receipt, ArrowRight, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";

interface Property {
    id: string;
    name: string;
    address: string | null;
    imageUrl: string | null;
    type: "OWNED" | "RENTED";
    _count: { expenses: number };
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function PropertiesPage() {
    const { loading: appLoading } = useAppContext();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/properties");
            if (res.ok) setProperties(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function deleteProperty(id: string) {
        if (!confirm("Eliminare questo immobile?")) return;
        await fetch(`/api/properties/${id}`, { method: "DELETE" });
        setProperties(prev => prev.filter(p => p.id !== id));
    }

    const isLoading = loading || appLoading;
    if (isLoading) return null;

    return (
        <motion.div initial="hidden" animate="visible" className="animate-gentle">
            <header style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="kpi-main-label">Patrimonio</div>
                    <h1 className="page-title" style={{ fontSize: 40 }}>Immobili</h1>
                </div>
                <Link href="/properties/new" className="btn-primary">
                    <Plus size={16} style={{ marginRight: 8 }} />
                    Nuovo Immobile
                </Link>
            </header>

            {properties.length === 0 ? (
                <div style={{ padding: 80, textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: 12 }}>
                    <p className="text-muted">Nessun immobile configurato.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {properties.map((p) => (
                        <motion.div
                            key={p.id}
                            variants={itemVariants}
                            className="card premium-card"
                            style={{ display: "flex", alignItems: "center", gap: 32, padding: "24px 32px" }}
                        >
                            <div style={{ width: 120, height: 120, borderRadius: 16, background: "var(--muted-bg)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <span style={{ fontSize: 40, opacity: 0.1 }}>🏠</span>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>{p.name}</h2>
                                    <span className="badge" style={{ background: "var(--muted-bg)", color: "var(--muted)" }}>
                                        {p.type === "OWNED" ? "Proprietà" : "Affitto"}
                                    </span>
                                </div>
                                {p.address && (
                                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                        <MapPin size={12} />
                                        {p.address}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
                                <div style={{ textAlign: "right" }}>
                                    <div className="kpi-main-label" style={{ marginBottom: 0 }}>Scadenze attive</div>
                                    <div style={{ fontSize: 18, fontWeight: 800 }}>{p._count.expenses}</div>
                                </div>

                                <div style={{ display: "flex", gap: 8 }}>
                                    <Link
                                        href={`/expenses?propertyId=${p.id}`}
                                        className="btn-secondary"
                                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}
                                    >
                                        <Receipt size={14} />
                                        <span>Gestisci</span>
                                    </Link>
                                    <Link
                                        href={`/properties/${p.id}`}
                                        className="btn-secondary"
                                        style={{ border: "none", background: "transparent", padding: 8 }}
                                    >
                                        <Pencil size={16} />
                                    </Link>
                                    <button
                                        onClick={() => deleteProperty(p.id)}
                                        className="btn-secondary"
                                        style={{ border: "none", color: "var(--danger)", background: "transparent", padding: 8 }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
