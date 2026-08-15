"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getCurrentDayKey, DAYS_OF_WEEK } from "@/lib/attendanceLogic";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import { revalidatePath } from "next/cache";

/**
 * 1. Manual Slot Save with Strict Conflict Detection
 */
export async function saveTimetableSlotAction(data: {
  classRoomId: string;
  sectionId: string;
  dayOfWeek: string;
  periodNumber: number;
  teacherId: string;
  subjectId: string;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  // Check for Teacher Conflict across ALL classes in the school
  const conflict = await prisma.timetableSlot.findFirst({
    where: {
      tenantId,
      dayOfWeek: data.dayOfWeek,
      periodNumber: data.periodNumber,
      teacherId: data.teacherId,
      NOT: {
        AND: [
          { classRoomId: data.classRoomId },
          { sectionId: data.sectionId },
        ],
      },
    },
    include: {
      teacher: true,
      classRoom: true,
      section: true,
      subject: true,
    },
  });

  if (conflict) {
    return {
      error: `⚠️ تضارب زمني غير مسموح: الأستاذ (${conflict.teacher.fullName}) مرتبط بالفعل بحصة (${conflict.subject.name}) في نفس هذا التوقيت في صف (${conflict.classRoom.name} - شعبة ${conflict.section.name}). يرجى اختيار أستاذ متفرغ أو تعديل التوقيت.`,
    };
  }

  // Upsert the slot
  const slot = await prisma.timetableSlot.upsert({
    where: {
      tenantId_classRoomId_sectionId_dayOfWeek_periodNumber: {
        tenantId,
        classRoomId: data.classRoomId,
        sectionId: data.sectionId,
        dayOfWeek: data.dayOfWeek,
        periodNumber: data.periodNumber,
      },
    },
    update: {
      teacherId: data.teacherId,
      subjectId: data.subjectId,
    },
    create: {
      tenantId,
      classRoomId: data.classRoomId,
      sectionId: data.sectionId,
      dayOfWeek: data.dayOfWeek,
      periodNumber: data.periodNumber,
      teacherId: data.teacherId,
      subjectId: data.subjectId,
    },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  return { success: true, slot };
}

/**
 * 2. Delete / Clear Slot
 */
export async function deleteTimetableSlotAction(data: {
  classRoomId: string;
  sectionId: string;
  dayOfWeek: string;
  periodNumber: number;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  await prisma.timetableSlot.deleteMany({
    where: {
      tenantId,
      classRoomId: data.classRoomId,
      sectionId: data.sectionId,
      dayOfWeek: data.dayOfWeek,
      periodNumber: data.periodNumber,
    },
  });

  revalidatePath("/admin/schedule");
  return { success: true };
}

/**
 * 2.1 Clear Entire Class/Section Schedule (تفريغ وحذف جدول الصف بالكامل)
 */
export async function clearEntireClassScheduleAction(data: {
  classRoomId: string;
  sectionId: string;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const deleted = await prisma.timetableSlot.deleteMany({
    where: {
      tenantId,
      classRoomId: data.classRoomId,
      sectionId: data.sectionId,
    },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  return { success: true, count: deleted.count };
}

/**
 * 3. Smart Auto-Fill Schedule Generator (ملء تلقائي ذكي مع منع التضارب)
 */
export async function autoGenerateScheduleAction(data: {
  classRoomId: string;
  sectionId: string;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  // 1. Get all teacher assignments for this class and section
  const assignments = await prisma.teacherAssignment.findMany({
    where: {
      tenantId,
      classRoomId: data.classRoomId,
      sectionId: data.sectionId,
    },
    include: {
      teacher: true,
      subject: true,
    },
  });

  if (assignments.length === 0) {
    return {
      error: "لا توجد تخصيصات مواد ومعلمين لهذا الصف. يرجى إضافة تخصيصات في صفحة المعلمين أولاً.",
    };
  }

  // Days and periods to populate
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
  const periods = [1, 2, 3, 4, 5, 6];

  let assignmentCursor = 0;
  let generatedCount = 0;

  // Transaction to auto-fill
  for (const day of days) {
    for (const period of periods) {
      // Find an assignment where the teacher is FREE during this (day, period)
      let selectedAssignment = null;

      for (let attempt = 0; attempt < assignments.length; attempt++) {
        const candidate = assignments[(assignmentCursor + attempt) % assignments.length];

        // Check if candidate teacher has conflict in other classes
        const hasConflict = await prisma.timetableSlot.findFirst({
          where: {
            tenantId,
            dayOfWeek: day,
            periodNumber: period,
            teacherId: candidate.teacherId,
            NOT: {
              AND: [{ classRoomId: data.classRoomId }, { sectionId: data.sectionId }],
            },
          },
        });

        if (!hasConflict) {
          selectedAssignment = candidate;
          assignmentCursor = (assignmentCursor + attempt + 1) % assignments.length;
          break;
        }
      }

      if (selectedAssignment) {
        await prisma.timetableSlot.upsert({
          where: {
            tenantId_classRoomId_sectionId_dayOfWeek_periodNumber: {
              tenantId,
              classRoomId: data.classRoomId,
              sectionId: data.sectionId,
              dayOfWeek: day,
              periodNumber: period,
            },
          },
          update: {
            teacherId: selectedAssignment.teacherId,
            subjectId: selectedAssignment.subjectId,
          },
          create: {
            tenantId,
            classRoomId: data.classRoomId,
            sectionId: data.sectionId,
            dayOfWeek: day,
            periodNumber: period,
            teacherId: selectedAssignment.teacherId,
            subjectId: selectedAssignment.subjectId,
          },
        });
        generatedCount++;
      }
    }
  }

  revalidatePath("/admin/schedule");
  return { success: true, generatedCount };
}

/**
 * 4. Record Teacher Leave & Alert Affected Classes
 */
export async function createTeacherLeaveAction(data: {
  teacherId: string;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const leave = await prisma.teacherLeave.create({
    data: {
      tenantId,
      teacherId: data.teacherId,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason.trim(),
      status: "APPROVED",
    },
    include: {
      teacher: true,
    },
  });

  revalidatePath("/admin/schedule");
  return { success: true, leave };
}

/**
 * 5. Get Teacher Leave Impact & Free Substitute Teacher Suggestions
 */
export async function getTeacherLeaveImpactData(dateStr?: string) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;
  const today = dateStr || new Date().toISOString().split("T")[0];
  const dayKey = getCurrentDayKey(new Date(today));

  // Find active teacher leaves covering this date
  const activeLeaves = await prisma.teacherLeave.findMany({
    where: {
      tenantId,
      status: "APPROVED",
      startDate: { lte: today },
      endDate: { gte: today },
    },
    include: {
      teacher: true,
    },
  });

  // For each on-leave teacher, find their timetable slots for today
  const impacts = [];

  for (const leave of activeLeaves) {
    const slots = await prisma.timetableSlot.findMany({
      where: {
        tenantId,
        teacherId: leave.teacherId,
        dayOfWeek: dayKey,
      },
      include: {
        classRoom: true,
        section: true,
        subject: true,
      },
      orderBy: { periodNumber: "asc" },
    });

    // For every slot, find free teachers (no scheduled slot in dayKey and periodNumber)
    const slotsWithSubstitutes = [];

    for (const slot of slots) {
      // Find all teachers who are BUSY in this period
      const busySlots = await prisma.timetableSlot.findMany({
        where: {
          tenantId,
          dayOfWeek: dayKey,
          periodNumber: slot.periodNumber,
        },
        select: { teacherId: true },
      });
      const busyTeacherIds = new Set(busySlots.map((b) => b.teacherId));

      // Find all on-leave teachers today
      const allOnLeaveTeacherIds = new Set(activeLeaves.map((l) => l.teacherId));

      // Get all active teachers
      const allTeachers = await prisma.user.findMany({
        where: {
          tenantId,
          role: "TEACHER",
          active: true,
        },
        include: {
          teacherAssignments: {
            include: { subject: true },
          },
        },
      });

      // Filter to teachers who are FREE (not busy and not on leave)
      const freeTeachers = allTeachers
        .filter((t) => !busyTeacherIds.has(t.id) && !allOnLeaveTeacherIds.has(t.id))
        .map((t) => {
          const teachesSameSubject = t.teacherAssignments.some(
            (a) => a.subjectId === slot.subjectId
          );
          return {
            id: t.id,
            fullName: t.fullName,
            phone: t.phone,
            teachesSameSubject,
            subjects: Array.from(new Set(t.teacherAssignments.map((a) => a.subject.name))),
          };
        })
        .sort((a, b) => (b.teachesSameSubject ? 1 : 0) - (a.teachesSameSubject ? 1 : 0));

      // Parse existing substitute if assigned
      const existingSubstitutes = JSON.parse(leave.substitutesJson || "[]");
      const assignedSub = existingSubstitutes.find(
        (sub: any) =>
          sub.periodNumber === slot.periodNumber &&
          sub.classRoomId === slot.classRoomId &&
          sub.sectionId === slot.sectionId
      );

      slotsWithSubstitutes.push({
        slot,
        freeTeachers,
        assignedSubstitute: assignedSub || null,
      });
    }

    impacts.push({
      leave,
      date: today,
      dayKey,
      impactedSlotsCount: slots.length,
      slotsWithSubstitutes,
    });
  }

  return impacts;
}

/**
 * 6. Assign Substitute Teacher to an Impacted Slot
 */
export async function assignSubstituteTeacherAction(data: {
  leaveId: string;
  periodNumber: number;
  classRoomId: string;
  sectionId: string;
  subjectId: string;
  substituteTeacherId: string;
  substituteTeacherName: string;
  notifyWhatsApp?: boolean;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const leave = await prisma.teacherLeave.findUnique({
    where: { id: data.leaveId, tenantId },
    include: { teacher: true },
  });

  if (!leave) return { error: "طلب الإجازة غير موجود" };

  const existingSubstitutes = JSON.parse(leave.substitutesJson || "[]");
  // Replace or push
  const filtered = existingSubstitutes.filter(
    (sub: any) =>
      !(
        sub.periodNumber === data.periodNumber &&
        sub.classRoomId === data.classRoomId &&
        sub.sectionId === data.sectionId
      )
  );

  filtered.push({
    periodNumber: data.periodNumber,
    classRoomId: data.classRoomId,
    sectionId: data.sectionId,
    subjectId: data.subjectId,
    substituteTeacherId: data.substituteTeacherId,
    substituteTeacherName: data.substituteTeacherName,
    assignedAt: new Date().toISOString(),
  });

  await prisma.teacherLeave.update({
    where: { id: data.leaveId },
    data: {
      substitutesJson: JSON.stringify(filtered),
    },
  });

  revalidatePath("/admin/schedule");
  return { success: true };
}
