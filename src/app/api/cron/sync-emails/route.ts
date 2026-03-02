import { NextResponse } from "next/server";
import { syncInboxes } from "@/lib/email/fetcher";

/**
 * Daily cron route to trigger AI email sync
 * In production, secure this with a secret header (CRON_SECRET)
 */
export async function GET(req: Request) {
    // Check for authorization (e.g. Vercel Cron Secret)
    const authHeader = req.headers.get("authorization");
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await syncInboxes();
        return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("Cron sync failed:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
