"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Check, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Expense {
    id: string;
    description: string | null;
    category: string;
    amount: number;
    dueDate: string | null;
    issuedAt: string;
    isPaid: boolean;
    isRecurring: boolean;
    frequency: string;
    property: { name: string };
}

const categoryIcon: Record<string, string> = {
    UTILITIES: "⚡", RENT: "🏠", MORTGAGE: "🏦", MAINTENANCE: "🔧",
    INSURANCE: "🛡️", TAX: "📋", CONDOMINIUM: "🏢", OTHER: "📄",
};
const categoryLabel: Record<string, string> = {
    UTILITIES: "Utenze", RENT: "Affitto", MORTGAGE: "Mutuo",
    MAINTENANCE: "Manutenzione", INSURANCE: "Assicurazione",
    TAX: "Tasse", CONDOMINIUM: "Condominio", OTHER: "Altro",
};

function fmtDate(d: string | null) {
    if (!d) return null;
    return format(new Date(d), "d MMM yyyy", { locale: it });
}

function fmtEur(amount: number) {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount);
}

function isOverdue(e: Expense) {
    return !e.isPaid && e.dueDate && new Date(e.dueDate) < new Date();
}

export default function ExpensesPage() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("propertyId");

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("all");

    const load = useCallback(async () => {
        const url = new URL("/api/expenses", window.location.origin);
        if (propertyId) url.searchParams.set("propertyId", propertyId);
        const res = await fetch(url.toString());
        if (res.ok) setExpenses(await res.json());
        setLoading(false);
    }, [propertyId]);

    useEffect(() => { load(); }, [load]);

    async function markPaid(id: string) {
        await fetch(`/api/expenses/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPaid: true, paidAt: new Date().toISOString() }),
        });
        setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, isPaid: true } : e));
    }

    async function deleteExpense(id: string) {
        if (!confirm("Eliminare questa spesa?")) return;
        await fetch(`/api/expenses/${id}`, { method: "DELETE" });
        setExpenses((prev) => prev.filter((e) => e.id !== id));
    }

    const filtered = expenses.filter((e) => {
        if (filter === "paid") return e.isPaid;
        if (filter === "unpaid") return !e.isPaid;
        return true;
    });

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Spese</h1>
                    <p className="page-subtitle">{expenses.length} spesa{expenses.length !== 1 ? "e" : ""} totali</p>
                </div>
                <Link href="/expenses/new" className="btn-primary">
                    <Plus size={16} />
                    Nuova spesa
                </Link>
            </div>

            <div className="filters-bar">
                {(["all", "unpaid", "paid"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={filter === f ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
                    >
                        {f === "all" ? "Tutte" : f === "unpaid" ? "Da pagare" : "Pagate"}
                    </button>
                ))}
                <span className="text-muted text-sm" style={{ marginLeft: "auto" }}>
                    {filtered.length} risultati
                </span>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🧾</div>
                    <p className="empty-title">Nessuna spesa trovata</p>
                    <p className="empty-sub">
                        {filter === "all"
                            ? "Aggiungi la tua prima spesa per iniziare"
                            : filter === "unpaid"
                                ? "Nessuna spesa da pagare 🎉"
                                : "Nessuna spesa pagata ancora"}
                    </p>
                    {filter === "all" && (
                        <Link href="/expenses/new" className="btn-primary">
                            <Plus size={16} /> Nuova spesa
                        </Link>
                    )}
                </div>
            ) : (
                <div className="expense-list">
                    {filtered.map((e) => {
                        const overdue = isOverdue(e);
                        return (
                            <div key={e.id} className={`expense-item ${e.isPaid ? "expense-item-paid" : ""}`}>
                                <div className="expense-icon">{categoryIcon[e.category] || "📄"}</div>
                                <div className="expense-info">
                                    <div className="expense-desc">
                                        {e.description || categoryLabel[e.category]}
                                    </div>
                                    <div className="expense-meta">
                                        <span>{e.property.name}</span>
                                        <span>·</span>
                                        <span>{categoryLabel[e.category]}</span>
                                        {e.dueDate && (
                                            <>
                                                <span>·</span>
                                                <span className={overdue ? "text-danger" : ""}>
                                                    {overdue ? "Scaduta " : "Scade "}
                                                    {fmtDate(e.dueDate)}
                                                </span>
                                            </>
                                        )}
                                        {e.isRecurring && (
                                            <>
                                                <span>·</span>
                                                <span>🔄 {e.frequency.toLowerCase()}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="expense-right">
                                    <div className={`expense-amount ${overdue ? "text-danger" : ""}`}>
                                        {fmtEur(e.amount)}
                                    </div>
                                    <div className="expense-actions">
                                        {e.isPaid ? (
                                            <span className="badge badge-success"><Check size={10} /> Pagata</span>
                                        ) : (
                                            <button
                                                onClick={() => markPaid(e.id)}
                                                className="btn-ghost btn-sm"
                                                title="Segna come pagata"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <Link href={`/expenses/${e.id}/edit`} className="btn-ghost btn-sm" title="Modifica">
                                            <Pencil size={14} />
                                        </Link>
                                        <button onClick={() => deleteExpense(e.id)} className="btn-danger btn-sm" title="Elimina">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
