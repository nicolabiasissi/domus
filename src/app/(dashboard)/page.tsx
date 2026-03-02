"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { format, startOfMonth, endOfMonth, subMonths, isAfter, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { Plus, AlertTriangle, Clock, TrendingUp, Sparkles } from "lucide-react";

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
        const loadDashboard = async () => {
            try {
                const res = await fetch("/api/expenses");
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const text = await res.text();
                if (text) {
                    setExpenses(JSON.parse(text));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (loading) return (
        <div className="loading-center">
            <div className="spinner" />
        </div>
    );

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
    const trendData = Array.from({ length: 12 }, (_, i) => {
        const monthDate = subMonths(now, 11 - i);
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
        <div className="dashboard-fade-in">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 28, letterSpacing: "-0.5px" }}>Riepilogo</h1>
                    <p className="page-subtitle">Benvenuto su Domus AI, il tuo assistente finanziario.</p>
                </div>
                <div className="header-actions">
                    <Link href="/expenses/new" className="btn-primary" style={{ borderRadius: 99, padding: "10px 24px" }}>
                        <Plus size={18} />
                        Nuova spesa
                    </Link>
                </div>
            </div>

            {/* MAIN KPI PANEL */}
            <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
                <div className="kpi-card premium-card" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)", color: "white", border: "none" }}>
                    <div className="kpi-label" style={{ color: "rgba(255,255,255,0.7)" }}>Spese del mese</div>
                    <div className="kpi-value" style={{ fontSize: 32 }}>{fmtEur(thisMonth)}</div>
                    <div className="kpi-sub" style={{ color: "rgba(255,255,255,0.6)" }}>{format(now, "MMMM yyyy", { locale: it })}</div>
                    <Sparkles size={40} style={{ position: "absolute", right: 20, top: 20, opacity: 0.1 }} />
                </div>
                <div className="kpi-card premium-card">
                    <div className="kpi-label">Totale anno</div>
                    <div className="kpi-value" style={{ color: "var(--primary)" }}>{fmtEur(thisYear)}</div>
                    <div className="kpi-sub">{now.getFullYear()}</div>
                </div>
                <div className="kpi-card premium-card">
                    <div className="kpi-label">Da pagare</div>
                    <div className="kpi-value" style={{ color: unpaid > 0 ? "var(--warning)" : "var(--success)" }}>
                        {fmtEur(unpaid)}
                    </div>
                    <div className="kpi-sub">{expenses.filter(e => !e.isPaid).length} in attesa</div>
                </div>
                <div className="kpi-card premium-card">
                    <div className="kpi-label">Arretrate</div>
                    <div className="kpi-value" style={{ color: overdue > 0 ? "var(--danger)" : "var(--text-muted)" }}>
                        {fmtEur(overdue)}
                    </div>
                    <div className="kpi-sub">{expenses.filter(e => !e.isPaid && e.dueDate && new Date(e.dueDate) < now).length} superate</div>
                </div>
            </div>

            {!hasData ? (
                <div className="empty-state-card">
                    <div className="empty-icon">🏠</div>
                    <p className="empty-title">Inizia l&apos;automazione</p>
                    <p className="empty-sub">Aggiungi i tuoi immobili per attivare il rilevamento automatico delle bollette.</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                        <Link href="/properties/new" className="btn-primary" style={{ borderRadius: 99 }}>
                            Aggiungi immobile
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="dashboard-grid-layout" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                    <div className="dashboard-left-col" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* CHART TREND */}
                        <div className="chart-card premium-card" style={{ padding: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                <div className="chart-title" style={{ margin: 0, fontSize: 16 }}>
                                    <TrendingUp size={16} style={{ display: "inline", marginRight: 8, color: "var(--primary)" }} />
                                    Trend di spesa (12 mesi)
                                </div>
                            </div>
                            <div style={{ width: "100%", height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => `€${v}`}
                                        />
                                        <Tooltip
                                            formatter={(v: any) => [fmtEur(v as number), "Totale spesa"]}
                                            contentStyle={{
                                                fontSize: 12,
                                                borderRadius: 12,
                                                border: "none",
                                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                                padding: "10px 14px",
                                            }}
                                            itemStyle={{ fontWeight: 600, color: "var(--primary)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="var(--primary)"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* INSIGHTS */}
                        <div className="premium-card" style={{ padding: 24 }}>
                            <div className="chart-title" style={{ marginBottom: 20 }}>💡 Insight Intelligenti</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                <div className="insight-item" style={{ padding: 16, background: "var(--muted-bg)", borderRadius: 14 }}>
                                    <div className="kpi-label">Media mensile</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                                        {fmtEur(thisYear / Math.max(now.getMonth() + 1, 1))}
                                    </div>
                                    <p className="form-hint" style={{ marginTop: 4 }}>Basato sui dati del {now.getFullYear()}</p>
                                </div>
                                <div className="insight-item" style={{ padding: 16, background: "var(--muted-bg)", borderRadius: 14 }}>
                                    <div className="kpi-label">Proiezione fine anno</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: "var(--primary)" }}>
                                        {fmtEur((thisYear / Math.max(now.getMonth() + 1, 1)) * 12)}
                                    </div>
                                    <p className="form-hint" style={{ marginTop: 4 }}>Stima basata sulla media attuale</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-right-col" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* UPCOMING */}
                        <div className="premium-card" style={{ padding: 24 }}>
                            <div className="chart-title" style={{ marginBottom: 20 }}>
                                <Clock size={15} style={{ display: "inline", marginRight: 8 }} />
                                Prossime scadenze
                            </div>
                            {upcoming.length === 0 ? (
                                <p className="text-muted text-sm" style={{ textAlign: "center", padding: "20px 0" }}>Nessuna scadenza imminente</p>
                            ) : (
                                <div className="upcoming-list" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {upcoming.map((e) => {
                                        const daysLeft = Math.ceil((new Date(e.dueDate!).getTime() - now.getTime()) / 86400000);
                                        return (
                                            <div key={e.id} className="upcoming-mini-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{categoryIcon[e.category]} {categoryLabel[e.category]}</div>
                                                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{e.property.name}</div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtEur(e.amount)}</div>
                                                    <div style={{ fontSize: 11, color: daysLeft <= 3 ? "var(--danger)" : "var(--muted)" }}>
                                                        {daysLeft === 0 ? "Oggi" : `In ${daysLeft} gg`}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* CATEGORY DONUT */}
                        <div className="premium-card" style={{ padding: 24 }}>
                            <div className="chart-title" style={{ marginBottom: 20 }}>Analisi Categorie</div>
                            <div style={{ width: "100%", height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={catData.slice(0, 5)} layout="vertical" margin={{ left: -20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={12}>
                                            {catData.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="cat-legend" style={{ marginTop: 16 }}>
                                {catData.slice(0, 3).map((c, i) => (
                                    <div key={c.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ color: "var(--muted)" }}>{c.icon} {c.name}</span>
                                        <span style={{ fontWeight: 600 }}>{Math.round((c.total / thisYear) * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OVERDUE FLOATING ALERT */}
            {overdue > 0 && (
                <Link href="/expenses?filter=unpaid" className="floating-alert premium-card" style={{
                    position: "fixed", bottom: 24, right: 24, zIndex: 50,
                    background: "var(--danger)", color: "white", border: "none",
                    padding: "14px 24px", display: "flex", alignItems: "center", gap: 12,
                    boxShadow: "0 10px 30px rgba(220, 38, 38, 0.4)",
                    borderRadius: 99, textDecoration: "none"
                }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontWeight: 600 }}>{expenses.filter(e => !e.isPaid && e.dueDate && new Date(e.dueDate) < now).length} spesa/e scaduta/e ({fmtEur(overdue)})</span>
                </Link>
            )}
        </div>
    );
}
