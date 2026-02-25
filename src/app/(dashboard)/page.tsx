"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { format, startOfMonth, endOfMonth, subMonths, isAfter, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { Plus, AlertTriangle, Clock } from "lucide-react";

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

const categoryLabel: Record<string, string> = {
    UTILITIES: "Utenze", RENT: "Affitto", MORTGAGE: "Mutuo",
    MAINTENANCE: "Manut.", INSURANCE: "Assicur.", TAX: "Tasse",
    CONDOMINIUM: "Condom.", OTHER: "Altro",
};
const categoryIcon: Record<string, string> = {
    UTILITIES: "⚡", RENT: "🏠", MORTGAGE: "🏦", MAINTENANCE: "🔧",
    INSURANCE: "🛡️", TAX: "📋", CONDOMINIUM: "🏢", OTHER: "📄",
};

const COLORS = ["#4f46e5", "#7c3aed", "#db2777", "#d97706", "#059669", "#0891b2", "#64748b", "#be185d"];

function fmtEur(amount: number) {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount);
}

export default function DashboardPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/expenses")
            .then((r) => r.json())
            .then((data) => { setExpenses(data); setLoading(false); });
    }, []);

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // KPIs
    const thisMonth = expenses
        .filter((e) => {
            const d = new Date(e.issuedAt);
            return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const thisYear = expenses
        .filter((e) => new Date(e.issuedAt) >= yearStart)
        .reduce((sum, e) => sum + e.amount, 0);

    const unpaid = expenses
        .filter((e) => !e.isPaid)
        .reduce((sum, e) => sum + e.amount, 0);

    const overdue = expenses
        .filter((e) => !e.isPaid && e.dueDate && new Date(e.dueDate) < now)
        .reduce((sum, e) => sum + e.amount, 0);

    // Upcoming (next 14 days)
    const upcoming = expenses
        .filter((e) => {
            if (e.isPaid || !e.dueDate) return false;
            const d = new Date(e.dueDate);
            return d >= now && d <= addDays(now, 14);
        })
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5);

    // Category breakdown (this year)
    const byCat: Record<string, number> = {};
    expenses.filter((e) => new Date(e.issuedAt) >= yearStart).forEach((e) => {
        byCat[e.category] = (byCat[e.category] || 0) + e.amount;
    });
    const catData = Object.entries(byCat)
        .map(([cat, total]) => ({ name: categoryLabel[cat] || cat, icon: categoryIcon[cat] || "📄", total }))
        .sort((a, b) => b.total - a.total);

    // Monthly trend (last 6 months)
    const trendData = Array.from({ length: 6 }, (_, i) => {
        const monthDate = subMonths(now, 5 - i);
        const label = format(monthDate, "MMM", { locale: it });
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const total = expenses
            .filter((e) => { const d = new Date(e.issuedAt); return d >= start && d <= end; })
            .reduce((sum, e) => sum + e.amount, 0);
        return { name: label, total };
    });

    const hasData = expenses.length > 0;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Il conto economico della tua casa</p>
                </div>
                <Link href="/expenses/new" className="btn-primary">
                    <Plus size={16} />
                    Nuova spesa
                </Link>
            </div>

            {/* KPI CARDS */}
            <div className="kpi-grid">
                <div className="kpi-card kpi-primary">
                    <div className="kpi-label">Spese del mese</div>
                    <div className="kpi-value">{fmtEur(thisMonth)}</div>
                    <div className="kpi-sub">{format(now, "MMMM yyyy", { locale: it })}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Totale anno</div>
                    <div className="kpi-value">{fmtEur(thisYear)}</div>
                    <div className="kpi-sub">{now.getFullYear()}</div>
                </div>
                <div className="kpi-card kpi-warning">
                    <div className="kpi-label">Da pagare</div>
                    <div className="kpi-value">{fmtEur(unpaid)}</div>
                    <div className="kpi-sub">
                        {expenses.filter((e) => !e.isPaid).length} spese in attesa
                    </div>
                </div>
                <div className="kpi-card kpi-danger">
                    <div className="kpi-label">Arretrate</div>
                    <div className="kpi-value" style={{ color: overdue > 0 ? "var(--danger)" : "inherit" }}>
                        {fmtEur(overdue)}
                    </div>
                    <div className="kpi-sub">
                        {expenses.filter((e) => !e.isPaid && e.dueDate && new Date(e.dueDate) < now).length} scadenze superate
                    </div>
                </div>
            </div>

            {!hasData ? (
                <div className="empty-state" style={{ background: "white", border: "1px solid var(--card-border)", borderRadius: "var(--radius)", padding: "60px" }}>
                    <div className="empty-icon">🚀</div>
                    <p className="empty-title">Inizia ad aggiungere le tue spese</p>
                    <p className="empty-sub">La dashboard si riempirà con i tuoi dati appena aggiungi le prime spese</p>
                    <div style={{ display: "flex", gap: 12 }}>
                        <Link href="/properties/new" className="btn-secondary">
                            🏠 Aggiungi immobile
                        </Link>
                        <Link href="/expenses/new" className="btn-primary">
                            + Prima spesa
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* UPCOMING */}
                    {upcoming.length > 0 && (
                        <div className="upcoming-card">
                            <div className="upcoming-title">
                                <Clock size={14} style={{ display: "inline", marginRight: 6 }} />
                                Prossime scadenze (14 giorni)
                            </div>
                            {upcoming.map((e) => {
                                const daysLeft = Math.ceil((new Date(e.dueDate!).getTime() - now.getTime()) / 86400000);
                                return (
                                    <div key={e.id} className="upcoming-item">
                                        <div>
                                            <div className="upcoming-name">
                                                {categoryIcon[e.category]} {e.description || categoryLabel[e.category]}
                                            </div>
                                            <div className="upcoming-property">{e.property.name}</div>
                                        </div>
                                        <div className="upcoming-right">
                                            <div className="upcoming-amount">{fmtEur(e.amount)}</div>
                                            <div className={`upcoming-date ${daysLeft <= 3 ? "text-danger" : "text-warning"}`}>
                                                {daysLeft === 0 ? "Oggi!" : daysLeft === 1 ? "Domani" : `Tra ${daysLeft} giorni`}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* OVERDUE ALERT */}
                    {overdue > 0 && (
                        <div style={{
                            background: "var(--danger-bg)",
                            border: "1px solid #fca5a5",
                            borderRadius: "var(--radius-sm)",
                            padding: "12px 16px",
                            marginBottom: 24,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            fontSize: 14,
                            color: "var(--danger)",
                            fontWeight: 500,
                        }}>
                            <AlertTriangle size={16} />
                            Hai {expenses.filter((e) => !e.isPaid && e.dueDate && new Date(e.dueDate) < now).length} spesa/e scadute per un totale di {fmtEur(overdue)}.
                            <Link href="/expenses?filter=unpaid" style={{ marginLeft: "auto", color: "var(--danger)", textDecoration: "underline", fontWeight: 600 }}>
                                Vedi ora
                            </Link>
                        </div>
                    )}

                    {/* CHARTS */}
                    <div className="charts-grid">
                        {/* TREND MENSILE */}
                        <div className="chart-card">
                            <div className="chart-title">📈 Trend mensile</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        formatter={(v: number) => [fmtEur(v), "Totale"]}
                                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8e6e0" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#4f46e5"
                                        strokeWidth={2.5}
                                        dot={{ fill: "#4f46e5", r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* BREAKDOWN CATEGORIE */}
                        <div className="chart-card">
                            <div className="chart-title">🥧 Spese per categoria ({now.getFullYear()})</div>
                            {catData.length === 0 ? (
                                <div style={{ color: "var(--muted)", fontSize: 13, paddingTop: 16 }}>Nessun dato</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={catData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip
                                            formatter={(v: number) => [fmtEur(v), "Importo"]}
                                            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8e6e0" }}
                                        />
                                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                            {catData.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* COSTO MEDIO */}
                    {isAfter(now, yearStart) && (
                        <div className="card" style={{ marginTop: 0 }}>
                            <div className="chart-title">💡 Insight</div>
                            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                                <div>
                                    <div className="kpi-label">Costo medio mensile</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                                        {fmtEur(thisYear / Math.max(now.getMonth() + 1, 1))}
                                    </div>
                                </div>
                                <div>
                                    <div className="kpi-label">Proiezione annuale</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                                        {fmtEur((thisYear / Math.max(now.getMonth() + 1, 1)) * 12)}
                                    </div>
                                </div>
                                <div>
                                    <div className="kpi-label">Categoria più costosa</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                                        {catData[0] ? `${catData[0].icon} ${catData[0].name}` : "—"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
