import { prisma } from "./prisma";

export type NotificationType =
  | "REPORT"
  | "GRADE"
  | "LEAVE"
  | "PAYMENT"
  | "ATTENDANCE"
  | "SYSTEM";

interface SendNotificationParams {
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Creates a single in-app notification for a specific user
 */
export async function createInAppNotification({
  tenantId,
  userId,
  title,
  message,
  type = "SYSTEM",
  link,
}: SendNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        tenantId,
        userId,
        title,
        message,
        type,
        link,
      },
    });
  } catch (error) {
    console.error("Failed to create in-app notification:", error);
    return null;
  }
}

/**
 * Sends a notification to all ADMIN users in a given tenant
 */
export async function notifyAdmins({
  tenantId,
  title,
  message,
  type = "SYSTEM",
  link,
}: {
  tenantId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}) {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { tenantId, role: "ADMIN", active: true },
      select: { id: true },
    });

    if (adminUsers.length === 0) return [];

    const notifications = await prisma.notification.createMany({
      data: adminUsers.map((admin) => ({
        tenantId,
        userId: admin.id,
        title,
        message,
        type,
        link,
      })),
    });

    return notifications;
  } catch (error) {
    console.error("Failed to notify admins:", error);
    return [];
  }
}

/**
 * Sends a notification to all active students in a specific classroom (and optionally section)
 */
export async function notifyClassStudents({
  tenantId,
  classRoomId,
  sectionId,
  title,
  message,
  type = "SYSTEM",
  link,
}: {
  tenantId: string;
  classRoomId: string;
  sectionId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}) {
  try {
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        tenantId,
        classRoomId,
        ...(sectionId ? { sectionId } : {}),
        registrationStatus: "ACTIVE",
      },
      select: { userId: true },
    });

    if (studentProfiles.length === 0) return [];

    const notifications = await prisma.notification.createMany({
      data: studentProfiles.map((sp) => ({
        tenantId,
        userId: sp.userId,
        title,
        message,
        type,
        link,
      })),
    });

    return notifications;
  } catch (error) {
    console.error("Failed to notify class students:", error);
    return [];
  }
}
