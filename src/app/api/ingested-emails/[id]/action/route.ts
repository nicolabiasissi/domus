import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { id, action, propertyId } = await request.json();

    if (!id || !action) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

    const ingested = await prisma.ingestedEmail.findUnique({
        where: { id, userId: session.user.id },
    });

    if (!ingested) return NextResponse.json({ error: "Email non trovata" }, { status: 404 });

    if (action === "DISCARD") {
        await prisma.ingestedEmail.update({
            where: { id },
            data: { status: "SKIPPED" }
        });
        return NextResponse.json({ success: true });
    }

    if (action === "CONFIRM") {
        const raw = ingested.rawJson as any;
        const targetPropertyId = propertyId || (ingested.rawJson as any)?.["propertyId"];

        if (!targetPropertyId) return NextResponse.json({ error: "Immobile non specificato" }, { status: 400 });

        await prisma.expense.create({
            data: {
                propertyId: targetPropertyId,
                amount: raw.amount || 0,
                category: (raw.category || "UTILITIES") as any,
                description: raw.description || `Bolletta ${raw.provider || "AI"}`,
                dueDate: raw.dueDate ? new Date(raw.dueDate) : null,
                issuedAt: new Date(ingested.receivedAt),
                isPaid: false,
                source: "AI_EMAIL",
                ingestedEmailId: ingested.id,
            }
        });

        await prisma.ingestedEmail.update({
            where: { id },
            data: { status: "CREATED" }
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
}
