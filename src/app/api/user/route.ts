import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    avatarUrl: z.string().url().optional().nullable(),
    gender: z.enum(["MALE", "FEMALE", "NEUTRAL"]).optional(),
    birthdate: z.string().datetime().optional().nullable(),
});

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            email: true,
            gender: true,
            birthdate: true,
            avatarUrl: true,
            plan: true,
            theme: true,
            language: true,
            currency: true,
            notifyEmail: true,
            notifyPush: true,
            createdAt: true,
            identityDocs: {
                select: {
                    id: true,
                    status: true,
                    extractedName: true,
                    createdAt: true
                },
                orderBy: { createdAt: "desc" },
                take: 1
            }
        },
    });

    if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    return NextResponse.json(user);
}
