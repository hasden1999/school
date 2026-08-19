"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import {
  notifyAdmins,
  notifyClassStudents,
  createInAppNotification,
} from "@/lib/notificationEngine";
import { revalidatePath } from "next/cache";

export async function createDailyReportAction(data: {
  classRoomId: string;
  sectionId: string;
  subjectId: string;
  dateStr: string;
  title: string;
  content: string;
  homework?: string;
}) {
  const session = await requireAuth(["TEACHER", "ADMIN"]);
  const tenantId = session.tenantId;

  const report = await prisma.dailyReport.create({
    data: {
      tenantId,
      teacherId: session.id,
      classRoomId: data.classRoomId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      date: data.dateStr,
      title: data.title.trim(),
      content: data.content.trim(),
      homework: data.homework?.trim(),
      status: session.role === "ADMIN" ? "APPROVED" : "PENDING_APPROVAL",
      approvedByAdminId: session.role === "ADMIN" ? session.id : null,
      approvedAt: session.role === "ADMIN" ? new Date() : null,
    },
    include: {
      subject: true,
      classRoom: true,
      section: true,
    },
  });

  // If created by Teacher, notify all Admins
  if (session.role === "TEACHER") {
    await notifyAdmins({
      tenantId,
      title: "تقرير وواجب يومي جديد بانتظار الاعتماد 📚",
      message: `قام الأستاذ (${session.fullName}) برفع تقرير يومي لمادة (${report.subject.name}) لصف (${report.classRoom.name} - شعبة ${report.section.name}).`,
      type: "REPORT",
      link: "/admin/reports",
    });
  } else if (session.role === "ADMIN") {
    // If created directly by Admin, notify class students immediately
    await notifyClassStudents({
      tenantId,
      classRoomId: data.classRoomId,
      sectionId: data.sectionId,
      title: "تقرير وواجب مدرسي جديد 📚",
      message: `تم نشر التقرير والواجب اليومي لمادة (${report.subject.name}) - يمكنك الاطلاع والتحضير الآن.`,
      type: "REPORT",
      link: "/student/reports",
    });
  }

  revalidatePath("/teacher/reports");
  revalidatePath("/admin/reports");
  revalidatePath("/student/reports");
  return { success: true, report };
}

export async function reviewDailyReportAction(data: {
  reportId: string;
  decision: "APPROVE" | "REJECT";
  rejectionReason?: string;
  notifyWhatsApp?: boolean;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const report = await prisma.dailyReport.findUnique({
    where: { id: data.reportId, tenantId },
    include: {
      teacher: true,
      subject: true,
      classRoom: true,
      section: true,
    },
  });

  if (!report) return { error: "التقرير غير موجود" };

  if (data.decision === "APPROVE") {
    await prisma.dailyReport.update({
      where: { id: data.reportId },
      data: {
        status: "APPROVED",
        approvedByAdminId: session.id,
        approvedAt: new Date(),
        adminRejectionReason: null,
      },
    });

    // 1. Notify the Teacher who submitted the report
    await createInAppNotification({
      tenantId,
      userId: report.teacherId,
      title: "تم اعتماد تقريرك اليومي بنجاح ✅",
      message: `اعتمدت الإدارة تقرير مادة (${report.subject.name}) للصف (${report.classRoom.name} - شعبة ${report.section.name}).`,
      type: "REPORT",
      link: "/teacher/reports",
    });

    // 2. Notify all students in this class and section
    await notifyClassStudents({
      tenantId,
      classRoomId: report.classRoomId,
      sectionId: report.sectionId,
      title: "تقرير وواجب مدرسي جديد 📚",
      message: `تم نشر التقرير والواجب اليومي لمادة (${report.subject.name}) - يمكنك الاطلاع والتحضير الآن.`,
      type: "REPORT",
      link: "/student/reports",
    });

    // 3. Notify parents via WhatsApp if requested
    if (data.notifyWhatsApp) {
      const school = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const students = await prisma.studentProfile.findMany({
        where: {
          tenantId,
          classRoomId: report.classRoomId,
          sectionId: report.sectionId,
          registrationStatus: "ACTIVE",
        },
        include: { user: true },
      });

      for (const s of students) {
        if (s.guardianPhone) {
          const msg = generateWhatsAppMessage({
            schoolName: school?.name || "المدرسة الأهلية",
            studentName: s.user.fullName,
            guardianName: s.guardianName,
            guardianPhone: s.guardianPhone,
            eventType: "REPORT_APPROVED",
            details: {
              subjectName: report.subject.name,
              teacherName: report.teacher.fullName,
              title: report.title,
              homework: report.homework,
            },
          });

          await prisma.whatsAppMessageQueue.create({
            data: {
              tenantId,
              recipientPhone: s.guardianPhone,
              recipientName: s.guardianName,
              eventType: "REPORT_APPROVED",
              messageText: msg,
              status: "QUEUED",
            },
          });
        }
      }
    }
  } else {
    await prisma.dailyReport.update({
      where: { id: data.reportId },
      data: {
        status: "REJECTED",
        adminRejectionReason: data.rejectionReason || "يرجى تعديل محتوى التقرير أو الواجب",
      },
    });

    // Notify the teacher about rejection with reason
    await createInAppNotification({
      tenantId,
      userId: report.teacherId,
      title: "إشعار بشأن تقريرك اليومي ⚠️",
      message: `تمت إعادة تقرير مادة (${report.subject.name}) مع ملاحظة الإدارة: ${data.rejectionReason || "يرجى المراجعة والتعديل"}.`,
      type: "REPORT",
      link: "/teacher/reports",
    });
  }

  revalidatePath("/admin/reports");
  revalidatePath("/teacher/reports");
  revalidatePath("/student/reports");
  return { success: true };
}

/**
 * Admin Directed Announcement / Broadcast
 * Can target: ALL school, specific CLASSROOM & SECTION, or a single STUDENT
 */
export async function createAdminAnnouncementAction(data: {
  targetScope: "ALL" | "CLASSROOM" | "STUDENT";
  classRoomId?: string;
  sectionId?: string;
  studentId?: string;
  title: string;
  message: string;
  notifyWhatsApp?: boolean;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const title = data.title.trim();
  const message = data.message.trim();

  if (!title || !message) {
    return { success: false, error: "يرجى كتابة عنوان ونص التبليغ." };
  }

  try {
    const school = await prisma.tenant.findUnique({ where: { id: tenantId } });

    // Determine target students
    let targetStudents: any[] = [];

    if (data.targetScope === "STUDENT" && data.studentId) {
      const student = await prisma.studentProfile.findUnique({
        where: { id: data.studentId, tenantId },
        include: { user: true, classRoom: true },
      });
      if (student) targetStudents = [student];
    } else if (data.targetScope === "CLASSROOM" && data.classRoomId) {
      targetStudents = await prisma.studentProfile.findMany({
        where: {
          tenantId,
          classRoomId: data.classRoomId,
          ...(data.sectionId ? { sectionId: data.sectionId } : {}),
          registrationStatus: "ACTIVE",
        },
        include: { user: true, classRoom: true },
      });
    } else {
      // ALL School
      targetStudents = await prisma.studentProfile.findMany({
        where: { tenantId, registrationStatus: "ACTIVE" },
        include: { user: true, classRoom: true },
      });
    }

    if (targetStudents.length === 0) {
      return { success: false, error: "لم يتم العثور على أي طلاب في النطاق المحدد." };
    }

    // 1. Batch create in-app notifications
    await prisma.notification.createMany({
      data: targetStudents.map((s) => ({
        tenantId,
        userId: s.userId,
        title: `📢 تبليغ إداري: ${title}`,
        message,
        type: "SYSTEM",
        link: "/student/dashboard",
      })),
    });

    // 2. If WhatsApp selected, queue messages
    if (data.notifyWhatsApp) {
      const queueEntries: any[] = [];

      for (const s of targetStudents) {
        if (s.guardianPhone) {
          const text = `📢 *تبليغ رسمي من إدارة ${school?.name || "المدرسة"}*\n\nعزيزي ولي أمر الطالب/ة: *${s.user.fullName}*\n\n📌 *الموضوع:* ${title}\n\n${message}\n\nمع تحيات إدارة المدرسة 🌹`;

          queueEntries.push({
            tenantId,
            recipientPhone: s.guardianPhone,
            recipientName: s.guardianName,
            eventType: "ADMIN_BROADCAST",
            messageText: text,
            status: "QUEUED",
          });
        }
      }

      if (queueEntries.length > 0) {
        await prisma.whatsAppMessageQueue.createMany({
          data: queueEntries,
        });
      }
    }

    revalidatePath("/admin/reports");
    revalidatePath("/admin/whatsapp");
    revalidatePath("/student/dashboard");

    return {
      success: true,
      message: `تم إرسال التبليغ الإداري بنجاح إلى (${targetStudents.length}) طالب/ولي أمر.`,
    };
  } catch (e: any) {
    return { success: false, error: e.message || "حدث خطأ أثناء إرسال التبليغ" };
  }
}


