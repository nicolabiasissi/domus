"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.ok) {
                router.push("/");
                router.refresh();
            } else {
                setError(res?.error || "Email o password non corretti");
            }
        } catch (err) {
            setError("Si è verificato un errore di sistema");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-container"
            >
                <header className="auth-header">
                    <Logo size="lg" />
                    <h1 className="auth-title">Sistema di Accesso</h1>
                </header>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error" style={{ textAlign: "left" }}>{error}</div>}

                    <div className="auth-input-group">
                        <label className="auth-label">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            placeholder="mail@esempio.it"
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? "Verifica in corso..." : "Accedi alla Dashboard"}
                    </button>
                </form>

                <p className="auth-footer">
                    Nuovo su Domus?{" "}
                    <Link href="/auth/register" className="auth-link">
                        Crea un account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
