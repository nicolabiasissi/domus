import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const preferencesSchema = z.object({
    theme: z.enum(["LIGHT", "DARK", "AUTO"]).optional(),
    language: z.string().min(2).max(10).optional(),
    currency: z.string().min(3).max(3).optional(),
    notifyEmail: z.boolean().optional(),
    notifyPush: z.boolean().optional(),
});

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            theme: true,
            language: true,
            currency: true,
            notifyEmail: true,
            notifyPush: true,
        },
    });

    if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    return NextResponse.json(user);
}

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    try {
        const body = await request.json();
        const parsed = preferencesSchema.safeParse(body);
        if (!parsed.success) {
            console.error("[preferences] Validation error:", parsed.error.format());
            return NextResponse.json({ error: "Dati non validi", details: parsed.error.format() }, { status: 400 });
        }

        // Don't send empty object to Prisma
        if (Object.keys(parsed.data).length === 0) {
            return NextResponse.json({ message: "Nessuna modifica" });
        }

        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data: parsed.data,
            select: {
                theme: true,
                language: true,
                currency: true,
                notifyEmail: true,
                notifyPush: true,
            },
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error("[preferences] PATCH error:", e);
        return NextResponse.json({ error: "Errore durante l'aggiornamento delle preferenze" }, { status: 500 });
    }
}
