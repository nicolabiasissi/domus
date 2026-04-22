"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Theme = "LIGHT" | "DARK" | "AUTO";
type Plan = "BASIC" | "PRO";
type Gender = "MALE" | "FEMALE" | "NEUTRAL";

interface User {
    id: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    email: string;
    gender: Gender;
    birthdate: string | null;
    avatarUrl: string | null;
    plan: Plan;
    theme: Theme;
    language: string;
    currency: string;
    notifyEmail: boolean;
    notifyPush: boolean;
    identityDocs?: {
        id: string;
        status: "PENDING" | "VERIFIED" | "FAILED";
        extractedName: string | null;
        createdAt: string;
    }[];
}

interface AppContextType {
    user: User | null;
    loading: boolean;
    updateProfile: (data: Partial<Pick<User, "firstName" | "lastName" | "avatarUrl" | "gender" | "birthdate">>) => Promise<void>;
    updatePreferences: (data: Partial<Pick<User, "theme" | "language" | "currency" | "notifyEmail" | "notifyPush">>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Initial sync from session to avoid flicker
            if (!user) {
                setUser({
                    id: session.user.id,
                    firstName: (session.user as any).firstName || null,
                    lastName: (session.user as any).lastName || null,
                    name: session.user.name || null,
                    email: session.user.email || "",
                    avatarUrl: session.user.image || null,
                    gender: (session.user as any).gender || "NEUTRAL",
                    birthdate: (session.user as any).birthdate || null,
                    plan: (session.user as any).plan || "BASIC",
                    theme: (session.user as any).theme || "AUTO",
                    language: "it", // fallback
                    currency: "EUR", // fallback
                    notifyEmail: true,
                    notifyPush: true
                });
            }
            fetchUser();
        } else if (status === "unauthenticated") {
            setLoading(false);
            setUser(null);
        }
    }, [status, session]);

    useEffect(() => {
        if (user) {
            applyTheme(user.theme);
        }
    }, [user?.theme]);

    useEffect(() => {
        // Handle system theme changes if set to AUTO
        if (user?.theme === "AUTO") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => applyTheme("AUTO");
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [user?.theme]);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                applyTheme(data.theme);
            } else if (res.status === 401) {
                setUser(null);
            }
        } catch (err) {
            console.error("Failed to fetch user state, using session fallback", err);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (theme: Theme) => {
        const root = window.document.documentElement;
        let isDark = theme === "DARK";

        if (theme === "AUTO") {
            isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }

        if (isDark) {
            root.classList.remove("light");
        } else {
            root.classList.add("light");
        }
    };

    const updateProfile = async (data: Partial<Pick<User, "firstName" | "lastName" | "avatarUrl" | "gender" | "birthdate">>) => {
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const updated = await res.json();
                setUser(prev => prev ? { ...prev, ...updated } : null);
            } else {
                const error = await res.json();
                throw new Error(error.error || "Failed to update profile");
            }
        } catch (err) {
            console.error("Failed to update profile:", err);
            throw err;
        }
    };

    const updatePreferences = async (data: Partial<Pick<User, "theme" | "language" | "currency" | "notifyEmail" | "notifyPush">>) => {
        try {
            const res = await fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const updated = await res.json();
                setUser(prev => prev ? { ...prev, ...updated } : null);
            } else {
                const error = await res.json();
                throw new Error(error.error || "Failed to update preferences");
            }
        } catch (err) {
            console.error("Failed to update preferences:", err);
            throw err;
        }
    };

    return (
        <AppContext.Provider value={{ user, loading, updateProfile, updatePreferences }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}
