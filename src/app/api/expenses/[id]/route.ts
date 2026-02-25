import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    category: z.enum(["UTILITIES", "RENT", "MORTGAGE", "MAINTENANCE", "INSURANCE", "TAX", "CONDOMINIUM", "OTHER"]).optional(),
    description: z.string().optional(),
    amount: z.number().positive().optional(),
    issuedAt: z.string().optional(),
    dueDate: z.string().optional().nullable(),
    isPaid: z.boolean().optional(),
    paidAt: z.string().optional().nullable(),
    isRecurring: z.boolean().optional(),
    frequency: z.enum(["NONE", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
    notes: z.string().optional(),
});

async function getExpense(id: string, userId: string) {
    return prisma.expense.findFirst({
        where: { id, property: { userId } },
    });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { id } = await params;
    const expense = await getExpense(id, session.user.id);
    if (!expense) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { issuedAt, dueDate, paidAt, ...rest } = parsed.data;
    const updated = await prisma.expense.update({
        where: { id },
        data: {
            ...rest,
            ...(issuedAt !== undefined ? { issuedAt: new Date(issuedAt) } : {}),
            ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
            ...(paidAt !== undefined ? { paidAt: paidAt ? new Date(paidAt) : null } : {}),
        },
    });
    return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { id } = await params;
    const expense = await getExpense(id, session.user.id);
    if (!expense) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
