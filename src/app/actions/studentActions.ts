"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import { revalidatePath } from "next/cache";

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
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  // 1. Generate clean username
  const cleanFirst = data.fullName.trim().split(" ")[0].toLowerCase().replace(/[^\u0621-\u064A0-9a-z]/g, "");
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const username = `s.${cleanFirst || "stu"}${randomSuffix}`;

  // 2. Generate random 8-character password
  const rawPassword = Math.random().toString(36).slice(-8);
  const passwordHash = await hashPassword(rawPassword);

  // 3. Generate sequential student number
  const studentCount = await prisma.studentProfile.count({ where: { tenantId } });
  const studentNumber = `STU-2025-${String(studentCount + 1).padStart(3, "0")}`;

  // 4. Create User & Profile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        username,
        fullName: data.fullName.trim(),
        passwordHash,
        role: "STUDENT",
        phone: data.guardianPhone.trim(),
        mustChangePassword: true,
      },
    });

    const profile = await tx.studentProfile.create({
      data: {
        tenantId,
        userId: user.id,
        studentNumber,
        guardianName: data.guardianName.trim(),
        guardianPhone: data.guardianPhone.trim(),
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
      const receiptCount = await tx.paymentReceipt.count({ where: { tenantId } });
      receiptNumber = `REC-2025-${String(receiptCount + 1).padStart(4, "0")}`;

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

    // Attach required documents
    const docReqs = await tx.documentRequirement.findMany({ where: { tenantId } });
    for (const req of docReqs) {
      await tx.studentDocument.create({
        data: {
          tenantId,
          studentId: profile.id,
          documentReqId: req.id,
          status: "MISSING",
        },
      });
    }

    // Initialize Grade Records for all subjects in this grade
    const subjects = await tx.subject.findMany({ where: { tenantId } });
    for (const sub of subjects) {
      await tx.gradeRecord.create({
        data: {
          tenantId,
          studentId: profile.id,
          subjectId: sub.id,
          classRoomId: data.classRoomId,
          academicYear: "2024-2025",
        },
      });
    }

    // Add WhatsApp Account Activation message to queue
    const school = await tx.tenant.findUnique({ where: { id: tenantId } });
    const msgText = generateWhatsAppMessage({
      schoolName: school?.name || "المدرسة الأهلية",
      studentName: data.fullName,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      eventType: "ACCOUNT_ACTIVATED",
      details: {
        username,
        password: rawPassword,
      },
    });

    await tx.whatsAppMessageQueue.create({
      data: {
        tenantId,
        recipientPhone: data.guardianPhone,
        recipientName: data.guardianName,
        eventType: "ACCOUNT_ACTIVATED",
        messageText: msgText,
        status: "QUEUED",
      },
    });

    return { user, profile, username, rawPassword, receiptNumber };
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/payments");
  return { success: true, ...result };
}

export async function getStudentsList(filters?: {
  classRoomId?: string;
  sectionId?: string;
  search?: string;
}) {
  const session = await requireAuth(["ADMIN", "TEACHER"]);
  const tenantId = session.tenantId;

  return prisma.studentProfile.findMany({
    where: {
      tenantId,
      ...(filters?.classRoomId && { classRoomId: filters.classRoomId }),
      ...(filters?.sectionId && { sectionId: filters.sectionId }),
      ...(filters?.search && {
        OR: [
          { user: { fullName: { contains: filters.search } } },
          { studentNumber: { contains: filters.search } },
          { guardianPhone: { contains: filters.search } },
        ],
      }),
    },
    include: {
      user: true,
      classRoom: true,
      section: true,
      documents: {
        include: { requirement: true },
      },
      paymentReceipts: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
