import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    type: z.enum(["OWNED", "RENTED"]).default("OWNED"),
    imageUrl: z.string().optional().nullable(),
    notes: z.string().optional(),
});

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const properties = await prisma.property.findMany({
        where: { userId: session.user.id },
        include: { _count: { select: { expenses: true } } },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(properties);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const property = await prisma.property.create({
        data: { ...parsed.data, userId: session.user.id },
    });
    return NextResponse.json(property, { status: 201 });
}
