import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    name: z.string().optional(),
    avatarUrl: z.string().url().optional().nullable(),
    theme: z.enum(["LIGHT", "DARK", "AUTO"]).optional(),
    language: z.string().optional(),
    currency: z.string().optional(),
    notifyEmail: z.boolean().optional(),
    notifyPush: z.boolean().optional(),
});

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            plan: true,
            theme: true,
            language: true,
            currency: true,
            notifyEmail: true,
            notifyPush: true,
            createdAt: true,
            emailConnection: {
                select: { id: true, email: true, provider: true, isActive: true, lastSyncAt: true },
            },
            identityDocs: {
                select: { id: true, status: true, extractedName: true, extractedAddress: true, createdAt: true },
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    return NextResponse.json(user);
}

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: parsed.data,
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            plan: true,
            theme: true,
            language: true,
            currency: true,
            notifyEmail: true,
            notifyPush: true,
        },
    });

    return NextResponse.json(updated);
}
