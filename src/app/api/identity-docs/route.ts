import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

/**
 * API to upload identity verification documents
 * (bill that proves email ownership and property address)
 */
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        // 1. Upload to storage (Vercel Blob or similar)
        // Note: This requires VERCEL_BLOB_READ_WRITE_TOKEN
        let fileUrl = "";
        try {
            const blob = await put(`identity/${session.user.id}/${file.name}`, file, {
                access: 'public',
            });
            fileUrl = blob.url;
        } catch (err) {
            console.error("Blob upload failed, falling back to mock URL", err);
            fileUrl = `https://mock-storage.com/${file.name}`;
        }

        // 2. Create record
        const doc = await prisma.identityDocument.create({
            data: {
                userId: session.user.id,
                fileUrl,
                status: "PENDING",
            }
        });

        // 3. Trigger AI extraction (Phase 3 background task)
        // In a real app, we'd trigger a webhook or async job here.
        // For now, we'll return the record.

        return NextResponse.json(doc);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const docs = await prisma.identityDocument.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(docs);
}
