"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserNotificationsAction() {
  try {
    const session = await requireAuth();
    const notifications = await prisma.notification.findMany({
      where: {
        tenantId: session.tenantId,
        userId: session.id,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        tenantId: session.tenantId,
        userId: session.id,
        isRead: false,
      },
    });

    return { success: true, notifications, unreadCount };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch notifications", notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const session = await requireAuth();
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        tenantId: session.tenantId,
        userId: session.id,
      },
      data: { isRead: true },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const session = await requireAuth();
    await prisma.notification.updateMany({
      where: {
        tenantId: session.tenantId,
        userId: session.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to mark all as read" };
  }
}

export async function clearReadNotificationsAction() {
  try {
    const session = await requireAuth();
    await prisma.notification.deleteMany({
      where: {
        tenantId: session.tenantId,
        userId: session.id,
        isRead: true,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to clear notifications" };
  }
}
