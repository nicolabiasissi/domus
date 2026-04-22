import React from "react";

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

export default function Skeleton({ className = "", width, height, circle }: SkeletonProps) {
    const style: React.CSSProperties = {
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: circle ? "50%" : "var(--radius-sm)",
        background: "linear-gradient(90deg, var(--muted-bg) 25%, var(--card-elevated) 50%, var(--muted-bg) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite linear",
    };

    return (
        <div className={`skeleton ${className}`} style={{ ...style }}>
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
