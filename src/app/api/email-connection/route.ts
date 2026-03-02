import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { email, password, provider, host, port, secure } = body;

        // In a real app, we would validate credentials here
        const connection = await prisma.emailConnection.upsert({
            where: { userId: session.user.id },
            update: {
                email,
                imapPassword: password, // IMPORTANT: In prod, encrypt this!
                provider,
                imapHost: host,
                imapPort: Number(port),
                imapSecure: secure,
                isActive: true,
            },
            create: {
                userId: session.user.id,
                email,
                imapPassword: password,
                provider,
                imapHost: host,
                imapPort: Number(port),
                imapSecure: secure,
            },
        });

        // Create a notification for the user
        await prisma.notification.create({
            data: {
                userId: session.user.id,
                title: "Email connessa",
                body: `Domus AI ha iniziato a monitorare la tua casella ${email}.`,
                type: "SYSTEM",
            }
        });

        return NextResponse.json(connection);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Connection failed" }, { status: 500 });
    }
}

export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await prisma.emailConnection.delete({
            where: { userId: session.user.id }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
    }
}
