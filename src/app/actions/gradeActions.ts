"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { calculateGrades } from "@/lib/gradeCalculations";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import { notifyClassStudents, notifyAdmins } from "@/lib/notificationEngine";
import { revalidatePath } from "next/cache";

export async function savePhaseGradesAction(data: {
  classRoomId: string;
  subjectId: string;
  phase: "month1" | "month2" | "midYear" | "month3" | "month4" | "finalExam";
  academicYear?: string;
  grades: Array<{
    studentId: string;
    score: number | null;
  }>;
}) {
  const session = await requireAuth(["ADMIN", "TEACHER"]);
  const tenantId = session.tenantId;
  const year = data.academicYear || "2024-2025";

  // If teacher, verify that teacher is assigned to this classroom and subject
  if (session.role === "TEACHER") {
    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        tenantId,
        teacherId: session.id,
        classRoomId: data.classRoomId,
        subjectId: data.subjectId,
      },
    });

    if (!assignment) {
      return { error: "غير مصرح لك بإدخال درجات هذه المادة أو هذا الصف" };
    }
  }

  // Save/Update grades and recalculate averages
  await prisma.$transaction(async (tx) => {
    for (const item of data.grades) {
      const existing = await tx.gradeRecord.findUnique({
        where: {
          tenantId_studentId_subjectId_academicYear: {
            tenantId,
            studentId: item.studentId,
            subjectId: data.subjectId,
            academicYear: year,
          },
        },
      });

      // Check lock for this phase if edited by teacher
      if (session.role === "TEACHER" && existing) {
        const lockField = `is${data.phase.charAt(0).toUpperCase() + data.phase.slice(1)}Locked` as keyof typeof existing;
        if (existing[lockField]) {
          throw new Error("هذه المرحلة مغلقة ومعتمدة من قبل الإدارة ولا يمكن التعديل عليها.");
        }
      }

      // Merge current score with existing inputs
      const currentInputs = {
        month1: data.phase === "month1" ? item.score : existing?.month1,
        month2: data.phase === "month2" ? item.score : existing?.month2,
        midYear: data.phase === "midYear" ? item.score : existing?.midYear,
        month3: data.phase === "month3" ? item.score : existing?.month3,
        month4: data.phase === "month4" ? item.score : existing?.month4,
        finalExam: data.phase === "finalExam" ? item.score : existing?.finalExam,
      };

      const calculated = calculateGrades(currentInputs);

      await tx.gradeRecord.upsert({
        where: {
          tenantId_studentId_subjectId_academicYear: {
            tenantId,
            studentId: item.studentId,
            subjectId: data.subjectId,
            academicYear: year,
          },
        },
        update: {
          [data.phase]: item.score,
          term1Average: calculated.term1Average,
          term2Average: calculated.term2Average,
          annualAverage: calculated.annualAverage,
          finalGrade: calculated.finalGrade,
        },
        create: {
          tenantId,
          studentId: item.studentId,
          subjectId: data.subjectId,
          classRoomId: data.classRoomId,
          academicYear: year,
          [data.phase]: item.score,
          term1Average: calculated.term1Average,
          term2Average: calculated.term2Average,
          annualAverage: calculated.annualAverage,
          finalGrade: calculated.finalGrade,
        },
      });
    }
  });

  revalidatePath("/admin/grades");
  revalidatePath("/teacher/grades");
  revalidatePath("/student/grades");
  return { success: true };
}

export async function togglePhaseLockAction(params: {
  classRoomId: string;
  subjectId?: string;
  phase: "month1" | "month2" | "midYear" | "month3" | "month4" | "finalExam";
  lock: boolean;
  academicYear?: string;
  notifyWhatsApp?: boolean;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;
  const year = params.academicYear || "2024-2025";
  const lockField = `is${params.phase.charAt(0).toUpperCase() + params.phase.slice(1)}Locked`;

  await prisma.gradeRecord.updateMany({
    where: {
      tenantId,
      classRoomId: params.classRoomId,
      ...(params.subjectId && { subjectId: params.subjectId }),
      academicYear: year,
    },
    data: {
      [lockField]: params.lock,
    },
  });

  // If locking phase & notifyWhatsApp enabled, queue WhatsApp notifications for the class
  if (params.lock && params.notifyWhatsApp) {
    const school = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const students = await prisma.studentProfile.findMany({
      where: { tenantId, classRoomId: params.classRoomId, registrationStatus: "ACTIVE" },
      include: { user: true },
    });

    const phaseNames: Record<string, string> = {
      month1: "الشهر الأول",
      month2: "الشهر الثاني",
      midYear: "نصف السنة",
      month3: "الشهر الثالث",
      month4: "الشهر الرابع",
      finalExam: "الامتحان النهائي",
    };

    // Send in-app notification to all students in this class
    const subject = await prisma.subject.findUnique({ where: { id: params.subjectId } });
    await notifyClassStudents({
      tenantId,
      classRoomId: params.classRoomId,
      title: "إعلان نتائج دراسية معتمدة 🎓",
      message: `تم اعتماد ونشر درجات (${phaseNames[params.phase] || params.phase}) لمادة (${subject?.name || "المادة"}) - يمكنك مراجعة بطاقة درجاتك الآن.`,
      type: "GRADE",
      link: "/student/grades",
    });

    for (const s of students) {
      if (s.guardianPhone) {
        const msg = generateWhatsAppMessage({
          schoolName: school?.name || "المدرسة الأهلية",
          studentName: s.user.fullName,
          guardianName: s.guardianName,
          guardianPhone: s.guardianPhone,
          eventType: "GRADES_PUBLISHED",
          details: { phaseName: phaseNames[params.phase] || params.phase },
        });

        await prisma.whatsAppMessageQueue.create({
          data: {
            tenantId,
            recipientPhone: s.guardianPhone,
            recipientName: s.guardianName,
            eventType: "GRADES_PUBLISHED",
            messageText: msg,
            status: "QUEUED",
          },
        });
      }
    }
  }

  revalidatePath("/admin/grades");
  revalidatePath("/teacher/grades");
  revalidatePath("/student/grades");
  return { success: true };
}

export async function getStudentReportCardData(studentId: string, academicYear = "2024-2025") {
  const session = await requireAuth();
  const tenantId = session.tenantId;

  // Security check: If student, ensure they only view their own grades
  if (session.role === "STUDENT") {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.id },
    });
    if (!studentProfile || studentProfile.id !== studentId) {
      throw new Error("UNAUTHORIZED");
    }
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId, tenantId },
    include: {
      user: true,
      classRoom: true,
      section: true,
      tenant: true,
      gradeRecords: {
        where: { academicYear },
        include: { subject: true },
        orderBy: { subject: { orderIndex: "asc" } },
      },
    },
  });

  return student;
}
