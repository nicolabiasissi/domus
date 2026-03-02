import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const unreadCount = await prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const body = await request.json();
    const ids: string[] | undefined = body.ids;

    if (ids && ids.length > 0) {
        // Mark specific notifications as read
        await prisma.notification.updateMany({
            where: { id: { in: ids }, userId: session.user.id },
            data: { isRead: true },
        });
    } else {
        // Mark all as read
        await prisma.notification.updateMany({
            where: { userId: session.user.id, isRead: false },
            data: { isRead: true },
        });
    }

    return NextResponse.json({ ok: true });
}
