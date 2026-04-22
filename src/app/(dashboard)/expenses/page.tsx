"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Check, Pencil, Trash2, Calendar, LayoutGrid, List } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/currency";

interface Expense {
    id: string;
    description: string | null;
    category: string;
    amount: number;
    dueDate: string | null;
    issuedAt: string;
    isPaid: boolean;
    property: { name: string };
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function ExpensesPage() {
    const { user, loading: appLoading } = useAppContext();
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("propertyId");
    const initialFilter = searchParams.get("filter") as "all" | "unpaid" | "paid" | null;

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unpaid" | "paid">(initialFilter || "all");

    const load = useCallback(async () => {
        const url = new URL("/api/expenses", window.location.origin);
        if (propertyId) url.searchParams.set("propertyId", propertyId);
        const res = await fetch(url.toString());
        if (res.ok) setExpenses(await res.json());
        setLoading(false);
    }, [propertyId]);

    useEffect(() => { load(); }, [load]);

    async function markPaid(id: string) {
        const res = await fetch(`/api/expenses/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPaid: true, paidAt: new Date().toISOString() }),
        });
        if (res.ok) setExpenses(prev => prev.map(e => e.id === id ? { ...e, isPaid: true } : e));
    }

    async function deleteExpense(id: string) {
        if (!confirm("Eliminare questa spesa?")) return;
        await fetch(`/api/expenses/${id}`, { method: "DELETE" });
        setExpenses(prev => prev.filter(e => e.id !== id));
    }

    const filtered = expenses.filter(e => {
        if (filter === "paid") return e.isPaid;
        if (filter === "unpaid") return !e.isPaid;
        return true;
    });

    const isLoading = loading || appLoading;
    if (isLoading) return null;

    const currency = user?.currency || "EUR";
    const lang = user?.language || "it";
    const fmt = (v: number) => formatCurrency(v, currency, lang);

    return (
        <motion.div initial="hidden" animate="visible" className="animate-gentle">
            <header style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="kpi-main-label">Contabilità</div>
                    <h1 className="page-title" style={{ fontSize: 40 }}>Flussi di Spesa</h1>
                </div>
                <Link href="/expenses/new" className="btn-primary">
                    <Plus size={16} style={{ marginRight: 8 }} />
                    Nuova Voce
                </Link>
            </header>

            <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid var(--card-border)", paddingBottom: 12 }}>
                {(["all", "unpaid", "paid"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            background: "none", border: "none",
                            color: filter === f ? "var(--foreground)" : "var(--muted)",
                            fontSize: 13, fontWeight: 700, padding: "8px 16px", cursor: "pointer",
                            position: "relative"
                        }}
                    >
                        {f === "all" ? "Totale" : f === "unpaid" ? "Da Pagare" : "Archivio"}
                        {filter === f && (
                            <motion.div
                                layoutId="activeFilter"
                                style={{ position: "absolute", bottom: -13, left: 0, right: 0, height: 2, background: "var(--foreground)" }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <AnimatePresence>
                    {filtered.map((e) => {
                        const overdue = !e.isPaid && e.dueDate && new Date(e.dueDate) < new Date();
                        return (
                            <motion.div
                                layout
                                key={e.id}
                                variants={itemVariants}
                                exit={{ opacity: 0, x: -10 }}
                                className="premium-card"
                                style={{
                                    borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none",
                                    padding: "20px 24px", display: "flex", alignItems: "center", gap: 24,
                                    background: "transparent"
                                }}
                            >
                                <div style={{ width: 4, height: 24, background: e.isPaid ? "var(--success)" : overdue ? "var(--danger)" : "var(--muted)", opacity: e.isPaid ? 0.3 : 1, borderRadius: 2 }} />

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: e.isPaid ? "var(--muted)" : "var(--foreground)" }}>
                                        {e.description || e.category}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, display: "flex", gap: 8 }}>
                                        <span>{e.property.name}</span>
                                        <span>·</span>
                                        {e.dueDate && (
                                            <span style={{ color: overdue ? "var(--danger)" : "inherit" }}>
                                                {format(new Date(e.dueDate), "dd MMM yyyy")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ textAlign: "right", marginRight: 32 }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: e.isPaid ? "var(--muted)" : "var(--foreground)" }}>
                                        {fmt(e.amount)}
                                    </div>
                                    <div className="badge" style={{
                                        padding: 0, fontSize: 10, marginTop: 4,
                                        color: e.isPaid ? "var(--success)" : overdue ? "var(--danger)" : "var(--warning)"
                                    }}>
                                        {e.isPaid ? "SALDATA" : overdue ? "SCADUTA" : "DA SALDARE"}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: 8 }}>
                                    {!e.isPaid && (
                                        <button onClick={() => markPaid(e.id)} className="btn-secondary" style={{ padding: 8, background: "var(--muted-bg)", border: "none" }}>
                                            <Check size={14} />
                                        </button>
                                    )}
                                    <Link href={`/expenses/${e.id}/edit`} className="btn-secondary" style={{ padding: 8, border: "none" }}>
                                        <Pencil size={14} />
                                    </Link>
                                    <button onClick={() => deleteExpense(e.id)} className="btn-secondary" style={{ padding: 8, border: "none", color: "var(--danger)" }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
