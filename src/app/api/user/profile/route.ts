import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Transform empty strings → undefined so subsequent validators are never violated
const emptyToUndefined = z.string().transform(v => (v.trim() === "" ? undefined : v.trim()));

const profileSchema = z.object({
    firstName: emptyToUndefined.optional(),
    lastName: emptyToUndefined.optional(),
    avatarUrl: z.string().optional().nullable(),
    gender: z.enum(["MALE", "FEMALE", "NEUTRAL"]).optional(),
    // Accept any string or null (manual Date conversion in handler is safer than .datetime())
    birthdate: z.string().optional().nullable(),
});

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    try {
        const body = await request.json();
        const parsed = profileSchema.safeParse(body);
        if (!parsed.success) {
            console.error("[profile] Validation error:", parsed.error.format());
            return NextResponse.json({ error: "Dati non validi", details: parsed.error.format() }, { status: 400 });
        }

        const { birthdate, ...rest } = parsed.data;
        const data: Record<string, unknown> = { ...rest };

        // Convert birthdate string → Date (or null) for Prisma
        if (birthdate !== undefined) {
            data.birthdate = birthdate ? new Date(birthdate) : null;
        }

        // Keep the legacy `name` field in sync for NextAuth compatibility
        if (rest.firstName !== undefined || rest.lastName !== undefined) {
            const existing = await prisma.user.findUnique({ where: { id: session.user.id } });
            const fn = rest.firstName ?? existing?.firstName ?? "";
            const ln = rest.lastName ?? existing?.lastName ?? "";
            data.name = `${fn} ${ln}`.trim() || null;
        }

        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                name: true,
                email: true,
                avatarUrl: true,
                gender: true,
                birthdate: true,
            },
        });

        return NextResponse.json({
            ...updated,
            name:
                updated.firstName && updated.lastName
                    ? `${updated.firstName} ${updated.lastName}`
                    : updated.name,
        });
    } catch (e) {
        console.error("[profile] PATCH error:", e);
        return NextResponse.json({ error: "Errore durante l'aggiornamento del profilo" }, { status: 500 });
    }
}
