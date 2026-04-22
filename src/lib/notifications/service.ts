import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export class NotificationService {
    static async create({
        userId,
        type,
        title,
        body,
        metadata = {}
    }: {
        userId: string;
        type: NotificationType;
        title: string;
        body: string;
        metadata?: any;
    }) {
        try {
            return await prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    body,
                    metadata,
                }
            });
        } catch (error) {
            console.error("Failed to create notification:", error);
            return null;
        }
    }

    static async markAsRead(notificationId: string) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
    }

    static async getUnreadCount(userId: string) {
        return await prisma.notification.count({
            where: { userId, isRead: false }
        });
    }
}
