import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(1).optional(),
    address: z.string().optional(),
    type: z.enum(["OWNED", "RENTED"]).optional(),
    imageUrl: z.string().optional().nullable(),
    notes: z.string().optional(),
});

async function getProperty(id: string, userId: string) {
    return prisma.property.findFirst({ where: { id, userId } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { id } = await params;
    const property = await getProperty(id, session.user.id);
    if (!property) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const updated = await prisma.property.update({ where: { id }, data: parsed.data });
    return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { id } = await params;
    const property = await getProperty(id, session.user.id);
    if (!property) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
