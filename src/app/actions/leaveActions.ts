"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import { run8AMLeaveResolution } from "@/lib/cronEngine";
import { notifyAdmins, createInAppNotification } from "@/lib/notificationEngine";
import { revalidatePath } from "next/cache";

export async function submitStudentLeaveAction(data: {
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl?: string;
}) {
  const session = await requireAuth(["STUDENT"]);
  const tenantId = session.tenantId;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
    include: { classRoom: true, section: true },
  });

  if (!profile) return { error: "الملف الشخصي للطالب غير موجود" };

  const leave = await prisma.leaveRequest.create({
    data: {
      tenantId,
      studentId: profile.id,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason.trim(),
      attachmentUrl: data.attachmentUrl,
      status: "PENDING",
    },
  });

  // Notify Admins about new leave request
  await notifyAdmins({
    tenantId,
    title: "طلب إجازة طالب جديد 🗓️",
    message: `قدم الطالب (${session.fullName} - ${profile.classRoom.name}) طلب إجازة لسبب (${data.reason.trim()}).`,
    type: "LEAVE",
    link: "/admin/leaves",
  });

  revalidatePath("/student/leaves");
  revalidatePath("/admin/leaves");
  return { success: true, leave };
}

export async function reviewLeaveRequestAction(data: {
  leaveId: string;
  decision: "APPROVED" | "REJECTED";
  rejectionReason?: string;
  notifyWhatsApp?: boolean;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: data.leaveId, tenantId },
    include: {
      student: { include: { user: true } },
    },
  });

  if (!leave) return { error: "طلب الإجازة غير موجود" };

  await prisma.leaveRequest.update({
    where: { id: data.leaveId },
    data: {
      status: data.decision,
      rejectionReason: data.decision === "REJECTED" ? data.rejectionReason : null,
      processedByAdminId: session.id,
      processedAt: new Date(),
    },
  });

  // 1. Notify Student in-app
  const dateRange = leave.startDate === leave.endDate ? leave.startDate : `من ${leave.startDate} إلى ${leave.endDate}`;
  await createInAppNotification({
    tenantId,
    userId: leave.student.userId,
    title: data.decision === "APPROVED" ? "تمت الموافقة على طلب الإجازة ✅" : "إشعار بشأن طلب الإجازة ⚠️",
    message:
      data.decision === "APPROVED"
        ? `وافقت إدارة المدرسة على طلب إجازتك للفترة (${dateRange}).`
        : `تم رفض طلب إجازتك للفترة (${dateRange}) - السبب: ${data.rejectionReason || "عدم استيفاء الشروط"}.`,
    type: "LEAVE",
    link: "/student/leaves",
  });

  // If approved, also trigger immediate sync to attendance if leave covers today
  const today = new Date().toISOString().split("T")[0];
  if (data.decision === "APPROVED" && leave.startDate <= today && leave.endDate >= today) {
    await prisma.attendanceRecord.upsert({
      where: {
        tenantId_studentId_date_periodNumber: {
          tenantId,
          studentId: leave.studentId,
          date: today,
          periodNumber: 1,
        },
      },
      update: {
        status: "ON_LEAVE",
        notes: `إجازة رسمية موافق عليها: ${leave.reason}`,
      },
      create: {
        tenantId,
        studentId: leave.studentId,
        classRoomId: leave.student.classRoomId,
        sectionId: leave.student.sectionId,
        date: today,
        periodNumber: 1,
        status: "ON_LEAVE",
        recordedByUserId: session.id,
        notes: `إجازة رسمية موافق عليها: ${leave.reason}`,
      },
    });
  }

  // WhatsApp notification
  if (data.notifyWhatsApp && leave.student.guardianPhone) {
    const school = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const msg = generateWhatsAppMessage({
      schoolName: school?.name || "المدرسة الأهلية",
      studentName: leave.student.user.fullName,
      guardianName: leave.student.guardianName,
      guardianPhone: leave.student.guardianPhone,
      eventType: "LEAVE_STATUS",
      details: {
        date: dateRange,
        isApproved: data.decision === "APPROVED",
        rejectionReason: data.rejectionReason,
      },
    });

    await prisma.whatsAppMessageQueue.create({
      data: {
        tenantId,
        recipientPhone: leave.student.guardianPhone,
        recipientName: leave.student.guardianName,
        eventType: "LEAVE_STATUS",
        messageText: msg,
        status: "QUEUED",
      },
    });
  }

  revalidatePath("/admin/leaves");
  revalidatePath("/admin/attendance");
  revalidatePath("/teacher/attendance");
  revalidatePath("/student/leaves");
  return { success: true };
}

export async function trigger8AMLeaveCronAction() {
  const session = await requireAuth(["ADMIN"]);
  const report = await run8AMLeaveResolution(session.tenantId);
  revalidatePath("/admin/leaves");
  revalidatePath("/admin/attendance");
  return report;
}
