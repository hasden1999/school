"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getCurrentDayKey, verifyPeriod1AttendancePermission } from "@/lib/attendanceLogic";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import { revalidatePath } from "next/cache";

export async function checkAttendancePermissionAction(params: {
  classRoomId: string;
  sectionId: string;
  dateStr?: string;
}) {
  const session = await requireAuth(["ADMIN", "TEACHER"]);
  const tenantId = session.tenantId;

  // Determine day of week
  const dateObj = params.dateStr ? new Date(params.dateStr) : new Date();
  const dayKey = getCurrentDayKey(dateObj);

  // Look up Timetable Slot for Period 1
  const period1Slot = await prisma.timetableSlot.findFirst({
    where: {
      tenantId,
      classRoomId: params.classRoomId,
      sectionId: params.sectionId,
      dayOfWeek: dayKey,
      periodNumber: 1,
    },
    include: {
      teacher: true,
      subject: true,
    },
  });

  const permission = verifyPeriod1AttendancePermission(
    session.id,
    session.role,
    period1Slot?.teacherId,
    period1Slot?.teacher?.fullName
  );

  return {
    ...permission,
    period1Slot,
  };
}

export async function submitAttendanceAction(data: {
  classRoomId: string;
  sectionId: string;
  dateStr: string;
  records: Array<{
    studentId: string;
    status: "PRESENT" | "ABSENT" | "ON_LEAVE" | "LATE";
    notes?: string;
  }>;
}) {
  const session = await requireAuth(["ADMIN", "TEACHER"]);
  const tenantId = session.tenantId;

  const todayStr = new Date().toISOString().split("T")[0];

  // Strictly block any modification or attendance taking on past dates
  if (data.dateStr < todayStr) {
    return {
      error: "🔒 لا يمكن تعديل أو تغيير كشف الحضور والغياب للأيام السابقة — السجل مؤرشف للاطلاع فقط.",
    };
  }

  // Prevent taking attendance in advance for future dates
  if (data.dateStr > todayStr) {
    return {
      error: "⚠️ لا يمكن تسجيل أو رصد الحضور لتاريخ مستقبلي مسبقاً.",
    };
  }

  // Verify permission
  const check = await checkAttendancePermissionAction({
    classRoomId: data.classRoomId,
    sectionId: data.sectionId,
    dateStr: data.dateStr,
  });

  if (!check.canTakeAttendance) {
    return { error: check.message };
  }

  const school = await prisma.tenant.findUnique({ where: { id: tenantId } });

  // Save attendance in a transaction
  await prisma.$transaction(async (tx) => {
    for (const rec of data.records) {
      const record = await tx.attendanceRecord.upsert({
        where: {
          tenantId_studentId_date_periodNumber: {
            tenantId,
            studentId: rec.studentId,
            date: data.dateStr,
            periodNumber: 1,
          },
        },
        update: {
          status: rec.status,
          notes: rec.notes,
          recordedByUserId: session.id,
          isOverriddenByAdmin: session.role === "ADMIN",
        },
        create: {
          tenantId,
          studentId: rec.studentId,
          classRoomId: data.classRoomId,
          sectionId: data.sectionId,
          date: data.dateStr,
          periodNumber: 1,
          status: rec.status,
          recordedByUserId: session.id,
          isOverriddenByAdmin: session.role === "ADMIN",
          notes: rec.notes,
        },
        include: {
          student: { include: { user: true } },
        },
      });

      // If student is marked ABSENT or ON_LEAVE, create in-app notification
      if (rec.status === "ABSENT" || rec.status === "ON_LEAVE" || rec.status === "LATE") {
        const statusMap: Record<string, string> = {
          ABSENT: "غائباً عن الدوام",
          ON_LEAVE: "مجازاً بإجازة رسمية",
          LATE: "متأخراً عن الطابور والحصة الأولى",
        };

        if (record.student?.userId) {
          await tx.notification.create({
            data: {
              tenantId,
              userId: record.student.userId,
              title: "تنبيه كشف الحضور والغياب ⚠️",
              message: `تم تسجيلك كـ (${statusMap[rec.status]}) في كشف الحضور الصباحي ليوم (${data.dateStr}).`,
              type: "ATTENDANCE",
              link: "/student/dashboard",
            },
          });
        }
      }

      // If student is marked ABSENT, queue automated WhatsApp message
      if (rec.status === "ABSENT" && record.student?.guardianPhone) {
        const msg = generateWhatsAppMessage({
          schoolName: school?.name || "المدرسة الأهلية",
          studentName: record.student.user.fullName,
          guardianName: record.student.guardianName,
          guardianPhone: record.student.guardianPhone,
          eventType: "STUDENT_ABSENT",
          details: {
            date: data.dateStr,
          },
        });

        await tx.whatsAppMessageQueue.create({
          data: {
            tenantId,
            recipientPhone: record.student.guardianPhone,
            recipientName: record.student.guardianName,
            eventType: "STUDENT_ABSENT",
            messageText: msg,
            status: "QUEUED",
          },
        });
      }
    }
  });

  revalidatePath("/admin/attendance");
  revalidatePath("/teacher/attendance");
  revalidatePath("/student/dashboard");
  return { success: true, count: data.records.length };
}

export async function getClassAttendanceData(params: {
  classRoomId: string;
  sectionId: string;
  dateStr: string;
}) {
  const session = await requireAuth(["ADMIN", "TEACHER"]);
  const tenantId = session.tenantId;

  const students = await prisma.studentProfile.findMany({
    where: {
      tenantId,
      classRoomId: params.classRoomId,
      sectionId: params.sectionId,
      registrationStatus: "ACTIVE",
    },
    include: {
      user: true,
      attendanceRecords: {
        where: {
          date: params.dateStr,
          periodNumber: 1,
        },
      },
    },
    orderBy: { user: { fullName: "asc" } },
  });

  return students;
}
