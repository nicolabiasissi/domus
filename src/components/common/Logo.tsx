"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
    const scales = {
        sm: { h: 24, font: 16 },
        md: { h: 32, font: 22 },
        lg: { h: 48, font: 32 },
    };

    const s = scales[size];

    return (
        <Link href="/" className={`logo-container ${className}`} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
                {/* House Mark SVG */}
                <svg
                    width={s.h}
                    height={s.h}
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ flexShrink: 0 }}
                >
                    <path
                        d="M20 45L50 15L80 45V85H20V45Z"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M40 85V60H60V85"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinejoin="round"
                    />
                    <rect x="65" y="30" width="8" height="15" fill="currentColor" />
                    {/* Abstract Blueprint/Scaffold lines from the image */}
                    <line x1="10" y1="55" x2="40" y2="25" stroke="currentColor" strokeWidth="4" />
                    <line x1="15" y1="65" x2="45" y2="35" stroke="currentColor" strokeWidth="4" />
                </svg>

                {/* DOMUS Wordmark */}
                <span
                    style={{
                        fontSize: s.font,
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        color: "var(--foreground)",
                        fontFamily: "var(--font-sans)",
                    }}
                >
                    DOMUS
                </span>
            </motion.div>
        </Link>
    );
}
