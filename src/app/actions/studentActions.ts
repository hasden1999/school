"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import { generateUniqueFiveLetterUsername, generateFiveLetterPasscode } from "@/lib/credentialGenerator";
import { generateAtomicStudentNumber, generateAtomicReceiptNumber } from "@/lib/atomicSequence";
import { revalidatePath } from "next/cache";

import { validateAndNormalizeIraqiPhone } from "@/lib/iraqiPhoneUtils";

export async function registerStudentAction(data: {
  fullName: string;
  guardianName: string;
  guardianPhone: string;
  classRoomId: string;
  sectionId: string;
  dateOfBirth?: string;
  address?: string;
  totalTuition: number;
  depositAmount: number;
  paymentMethod: string;
  depositNotes?: string;
}) {
  const session = await requireAuth(["ADMIN", "SUPER_ADMIN", "VICE_PRINCIPAL", "ACCOUNTANT", "STAFF"]);
  const tenantId = session.tenantId;

  if (!hasPermission(session, "MANAGE_STUDENTS")) {
    return { error: "ليس لديك صلاحية تسجيل وإضافة الطلاب في المنظومة." };
  }

  // Validate Iraqi Guardian Phone
  const phoneValidation = validateAndNormalizeIraqiPhone(data.guardianPhone);
  if (!phoneValidation.isValid) {
    return { error: phoneValidation.error || "رقم هاتف ولي الأمر غير صالح." };
  }

  const normalizedPhone = phoneValidation.normalized;

  // 1. Generate unique 5 distinct English letters username (no dots, no commas, no numbers)
  const username = await generateUniqueFiveLetterUsername(tenantId);

  // 2. Generate 5 distinct English letters passcode
  const rawPassword = generateFiveLetterPasscode();
  const passwordHash = await hashPassword(rawPassword);

  // 3. Generate sequential collision-proof student number
  const studentNumber = await generateAtomicStudentNumber(tenantId, "2025");

  // 4. Create User & Profile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        username,
        fullName: data.fullName.trim(),
        passwordHash,
        plainPasscode: rawPassword,
        role: "STUDENT",
        phone: normalizedPhone,
        mustChangePassword: true,
      },
    });

    const profile = await tx.studentProfile.create({
      data: {
        tenantId,
        userId: user.id,
        studentNumber,
        guardianName: data.guardianName.trim(),
        guardianPhone: normalizedPhone,
        classRoomId: data.classRoomId,
        sectionId: data.sectionId,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        totalTuition: Number(data.totalTuition),
        depositAmount: Number(data.depositAmount),
        registrationStatus: "ACTIVE",
      },
    });

    // If deposit > 0, create serialized PaymentReceipt
    let receiptNumber = "";
    if (data.depositAmount > 0) {
      receiptNumber = await generateAtomicReceiptNumber(tenantId, "2025");

      await tx.paymentReceipt.create({
        data: {
          tenantId,
          studentId: profile.id,
          receiptNumber,
          amount: Number(data.depositAmount),
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod: data.paymentMethod || "CASH",
          notes: data.depositNotes || "عربون التسجيل وتثبيت المقعد",
          receivedByUserId: session.id,
        },
      });
    }

    // Attach required documents in batch
    const docReqs = await tx.documentRequirement.findMany({ where: { tenantId } });
    if (docReqs.length > 0) {
      await tx.studentDocument.createMany({
        data: docReqs.map((req) => ({
          tenantId,
          studentId: profile.id,
          documentReqId: req.id,
          status: "MISSING",
        })),
      });
    }

    // Initialize Grade Records for all subjects in 1 fast query
    const subjects = await tx.subject.findMany({ where: { tenantId } });
    if (subjects.length > 0) {
      await tx.gradeRecord.createMany({
        data: subjects.map((sub) => ({
          tenantId,
          studentId: profile.id,
          subjectId: sub.id,
          classRoomId: data.classRoomId,
          academicYear: "2024-2025",
        })),
      });
    }

    // Add WhatsApp Account Activation message to queue
    const school = await tx.tenant.findUnique({ where: { id: tenantId } });
    const msgText = generateWhatsAppMessage({
      schoolName: school?.name || "المدرسة الأهلية",
      studentName: data.fullName,
      guardianName: data.guardianName,
      guardianPhone: normalizedPhone,
      eventType: "ACCOUNT_ACTIVATED",
      details: {
        username,
        password: rawPassword,
      },
    });

    await tx.whatsAppMessageQueue.create({
      data: {
        tenantId,
        recipientPhone: normalizedPhone,
        recipientName: data.guardianName,
        eventType: "ACCOUNT_ACTIVATED",
        messageText: msgText,
        status: "QUEUED",
      },
    });

    return { user, profile, username, rawPassword, receiptNumber };
  },
  { maxWait: 15000, timeout: 25000 });

  revalidatePath("/admin/students");
  revalidatePath("/admin/payments");
  return { success: true, ...result };
}

export async function updateStudentAction(
  studentId: string,
  data: {
    fullName: string;
    guardianName: string;
    guardianPhone: string;
    classRoomId: string;
    sectionId: string;
    totalTuition: number;
    depositAmount: number;
    dateOfBirth?: string;
    address?: string;
  }
) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId, tenantId },
      include: { user: true },
    });

    if (!student) {
      return { success: false, error: "الطالب غير موجود" };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update user info (fullName, phone)
      await tx.user.update({
        where: { id: student.userId },
        data: {
          fullName: data.fullName.trim(),
          phone: data.guardianPhone.trim(),
        },
      });

      // 2. Update student profile
      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          guardianName: data.guardianName.trim(),
          guardianPhone: data.guardianPhone.trim(),
          classRoomId: data.classRoomId,
          sectionId: data.sectionId,
          totalTuition: Number(data.totalTuition),
          depositAmount: Number(data.depositAmount),
          dateOfBirth: data.dateOfBirth,
          address: data.address,
        },
      });
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/grades");

    return { success: true, message: "تم تعديل بيانات الطالب بنجاح" };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل تعديل بيانات الطالب" };
  }
}

export async function archiveStudentAction(studentId: string) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  try {
    await prisma.studentProfile.update({
      where: { id: studentId, tenantId },
      data: {
        registrationStatus: "ARCHIVED",
        archivedAt: new Date(),
      },
    });

    revalidatePath("/admin/students");
    return { success: true, message: "تمت أرشفة الطالب بنجاح" };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل أرشفة الطالب" };
  }
}

export async function unarchiveStudentAction(studentId: string) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  try {
    await prisma.studentProfile.update({
      where: { id: studentId, tenantId },
      data: {
        registrationStatus: "ACTIVE",
        archivedAt: null,
      },
    });

    revalidatePath("/admin/students");
    return { success: true, message: "تمت استعادة الطالب وإلغاء الأرشفة بنجاح" };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل إلغاء الأرشفة" };
  }
}

export async function deleteStudentAction(studentId: string) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId, tenantId },
      include: { user: true },
    });

    if (!student) {
      return { success: false, error: "الطالب غير موجود" };
    }

    await prisma.$transaction(async (tx) => {
      // Delete child relations
      await tx.paymentReceipt.deleteMany({ where: { studentId } });
      await tx.gradeRecord.deleteMany({ where: { studentId } });
      await tx.attendanceRecord.deleteMany({ where: { studentId } });
      await tx.leaveRequest.deleteMany({ where: { studentId } });
      await tx.studentDocument.deleteMany({ where: { studentId } });
      await tx.teacherEvaluationSubmission.deleteMany({ where: { studentId } });

      // Delete profile and user
      await tx.studentProfile.delete({ where: { id: studentId } });
      await tx.user.delete({ where: { id: student.userId } });
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/grades");

    return { success: true, message: "تم حذف الطالب وسجلاته بنجاح" };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل حذف الطالب" };
  }
}

export async function applyTuitionDiscountAction(data: {
  studentId: string;
  discountAmount: number;
  discountReason: string;
  newTotalTuition: number;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  // Authorization: Super Admin, Admin/Owner, or User with MANAGE_DISCOUNTS
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const isOwnerAdmin = session.role === "ADMIN";
  const hasDiscountPerm = hasPermission(session, "MANAGE_DISCOUNTS");

  if (!isSuperAdmin && !isOwnerAdmin && !hasDiscountPerm) {
    return { error: "ليس لديك صلاحية منح تخفيض الأقساط. يرجى مراجعة المالك أو الإدارة العامة." };
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: data.studentId },
    include: { user: true },
  });

  if (!student || student.tenantId !== tenantId) {
    return { error: "سجل الطالب غير موجود في هذه المدرسة" };
  }

  const updatedProfile = await prisma.studentProfile.update({
    where: { id: data.studentId },
    data: {
      totalTuition: Number(data.newTotalTuition),
    },
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/payments");

  return { success: true, profile: updatedProfile };
}

