import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const emails = await prisma.ingestedEmail.findMany({
        where: {
            userId: session.user.id,
            ...(status ? { status: status as any } : {}),
        },
        include: {
            expense: {
                select: { id: true, amount: true, category: true, description: true },
            },
        },
        orderBy: { receivedAt: "desc" },
        take: 100,
    });

    return NextResponse.json(emails);
}
