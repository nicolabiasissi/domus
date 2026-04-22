"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { it } from "date-fns/locale";
import { Plus, ArrowUpRight, Calendar, AlertCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/currency";

interface Expense {
    id: string;
    amount: number;
    isPaid: boolean;
    issuedAt: string;
    dueDate: string | null;
    property: { name: string };
    category: string;
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DashboardPage() {
    const { user, loading: appLoading } = useAppContext();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res = await fetch("/api/expenses");
                if (res.ok) setExpenses(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const isLoading = loading || appLoading;
    if (isLoading) return <div className="loading-center"><div className="spinner" /></div>;

    const currency = user?.currency || "EUR";
    const lang = user?.language || "it";
    const fmt = (v: number) => formatCurrency(v, currency, lang);

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    const monthlyCost = expenses
        .filter(e => {
            const d = new Date(e.issuedAt);
            return d >= thisMonthStart && d <= thisMonthEnd;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const yearTotal = expenses
        .filter(e => new Date(e.issuedAt).getFullYear() === now.getFullYear())
        .reduce((sum, e) => sum + e.amount, 0);

    const unpaid = expenses.filter(e => !e.isPaid);
    const overdue = unpaid.filter(e => e.dueDate && new Date(e.dueDate) < now);
    const upcoming = unpaid
        .filter(e => e.dueDate && new Date(e.dueDate) >= now)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 3);

    const trendData = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(now, 5 - i);
        const start = startOfMonth(d);
        const end = endOfMonth(d);
        const total = expenses
            .filter(e => {
                const ed = new Date(e.issuedAt);
                return ed >= start && ed <= end;
            })
            .reduce((sum, e) => sum + e.amount, 0);
        return { name: format(d, "MMM", { locale: it }), total };
    });

    const hasData = trendData.some(d => d.total > 0);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: "#12151A", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 16px", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                    <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{fmt(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div initial="hidden" animate="visible" className="animate-gentle">
            {/* FOCUS POINT: Dominant Numbers */}
            <motion.section variants={itemVariants} style={{ textAlign: "center", marginBottom: 80, marginTop: 40 }}>
                <div className="kpi-main-label">Costi Mensili</div>
                <div className="kpi-main-value" style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.04em" }}>{fmt(monthlyCost)}</div>
                <div className="kpi-sub-value" style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
                    Bilancio annuale proiettato in <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{fmt(yearTotal)}</span>
                </div>
            </motion.section>

            {/* ACTION & ALERTS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 64 }}>
                <motion.div variants={itemVariants} className="card" style={{ padding: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                        <div>
                            <div className="kpi-main-label" style={{ marginBottom: 8 }}>Scadenze Arretrate</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: overdue.length > 0 ? "var(--danger)" : "var(--muted)" }}>
                                {overdue.length} {overdue.length === 1 ? "Pendenza" : "Pendenze"}
                            </div>
                        </div>
                        <AlertCircle className={overdue.length > 0 ? "text-danger" : "text-muted"} size={20} />
                    </div>
                    {overdue.length > 0 && (
                        <Link href="/expenses?filter=unpaid" className="btn-secondary" style={{ width: "100%", textAlign: "center", display: "block", textDecoration: "none", padding: "12px 0", fontSize: 13, fontWeight: 700 }}>
                            Gestisci pagamenti
                        </Link>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Link href="/expenses/new" className="btn-primary" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <Plus size={18} />
                        Aggiungi nuova spesa
                    </Link>
                </motion.div>
            </div>

            {/* TREND & UPCOMING GROUPED */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40 }}>
                <motion.section variants={itemVariants}>
                    <div className="kpi-main-label" style={{ marginBottom: 24 }}>Trend Semestrale</div>
                    <div style={{ width: "100%", height: 240, position: "relative" }}>
                        {!hasData && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, background: "rgba(11,13,16,0.5)", borderRadius: 12, backdropFilter: "blur(4px)" }}>
                                <div style={{ textAlign: "center" }}>
                                    <BarChart3 size={32} style={{ color: "var(--muted)", marginBottom: 12, opacity: 0.5 }} />
                                    <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>Nessun dato ancora disponibile</p>
                                </div>
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 2 }} />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="var(--foreground)"
                                    strokeWidth={3}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: "var(--foreground)" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants}>
                    <div className="kpi-main-label" style={{ marginBottom: 24 }}>Scadenze in arrivo</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {upcoming.length === 0 ? (
                            <div className="text-muted" style={{ padding: 24, textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: 12 }}>
                                Nessuna scadenza prossima
                            </div>
                        ) : (
                            upcoming.map(e => (
                                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{e.property.name}</div>
                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{e.category}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 15, fontWeight: 800 }}>{fmt(e.amount)}</div>
                                        {e.dueDate && (
                                            <div style={{ fontSize: 11, color: "var(--warning)", fontWeight: 700 }}>
                                                {format(new Date(e.dueDate), "dd MMM")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <Link href="/expenses" className="text-muted" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, textDecoration: "none", marginTop: 8 }}>
                            Vedi tutta la contabilità <ArrowUpRight size={12} />
                        </Link>
                    </div>
                </motion.section>
            </div>
        </motion.div>
    );
}
