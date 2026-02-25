import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    propertyId: z.string(),
    category: z.enum(["UTILITIES", "RENT", "MORTGAGE", "MAINTENANCE", "INSURANCE", "TAX", "CONDOMINIUM", "OTHER"]).default("OTHER"),
    description: z.string().optional(),
    amount: z.number().positive(),
    issuedAt: z.string().optional(),
    dueDate: z.string().optional(),
    isPaid: z.boolean().default(false),
    isRecurring: z.boolean().default(false),
    frequency: z.enum(["NONE", "MONTHLY", "QUARTERLY", "YEARLY"]).default("NONE"),
    notes: z.string().optional(),
});

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const isPaid = searchParams.get("isPaid");

    const properties = await prisma.property.findMany({
        where: { userId: session.user.id },
        select: { id: true },
    });
    const propertyIds = properties.map((p) => p.id);

    const expenses = await prisma.expense.findMany({
        where: {
            propertyId: propertyId ? propertyId : { in: propertyIds },
            ...(isPaid !== null && isPaid !== undefined ? { isPaid: isPaid === "true" } : {}),
        },
        include: { property: { select: { name: true } } },
        orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(expenses);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    // verify property belongs to user
    const property = await prisma.property.findFirst({
        where: { id: parsed.data.propertyId, userId: session.user.id },
    });
    if (!property) return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });

    const { issuedAt, dueDate, ...rest } = parsed.data;
    const expense = await prisma.expense.create({
        data: {
            ...rest,
            issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
            dueDate: dueDate ? new Date(dueDate) : undefined,
        },
    });
    return NextResponse.json(expense, { status: 201 });
}
