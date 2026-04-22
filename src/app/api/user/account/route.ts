import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            plan: true,
            createdAt: true,
            emailConnection: {
                select: { id: true, email: true, provider: true, isActive: true, lastSyncAt: true },
            },
        },
    });

    if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    return NextResponse.json(user);
}
