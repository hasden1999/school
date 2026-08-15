"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import { createInAppNotification } from "@/lib/notificationEngine";
import { revalidatePath } from "next/cache";

export async function recordPaymentAction(data: {
  studentId: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "ZAIN_CASH";
  notes?: string;
  notifyWhatsApp?: boolean;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const student = await prisma.studentProfile.findUnique({
    where: { id: data.studentId, tenantId },
    include: {
      user: true,
      paymentReceipts: true,
    },
  });

  if (!student) return { error: "الطالب غير موجود" };

  const receiptCount = await prisma.paymentReceipt.count({ where: { tenantId } });
  const receiptNumber = `REC-2025-${String(receiptCount + 1).padStart(4, "0")}`;
  const today = new Date().toISOString().split("T")[0];

  const receipt = await prisma.paymentReceipt.create({
    data: {
      tenantId,
      studentId: data.studentId,
      receiptNumber,
      amount: Number(data.amount),
      paymentDate: today,
      paymentMethod: data.paymentMethod,
      notes: data.notes?.trim(),
      receivedByUserId: session.id,
    },
  });

  // Calculate new balance
  const totalPaid = student.paymentReceipts.reduce((sum, r) => sum + r.amount, 0) + Number(data.amount) + student.depositAmount;
  const remaining = student.totalTuition - totalPaid;

  const school = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const curr = school?.currency || "د.ع";

  // In-App Notification to the student
  await createInAppNotification({
    tenantId,
    userId: student.userId,
    title: "وصل استلام وتسديد دفعة مالية 💳",
    message: `تم تسجيل دفعة بقيمة (${Number(data.amount).toLocaleString()} ${curr}) وإصدار الوصل (${receiptNumber}) بنجاح. المتبقي: ${Number(remaining).toLocaleString()} ${curr}.`,
    type: "PAYMENT",
    link: "/student/payments",
  });

  if (data.notifyWhatsApp && student.guardianPhone) {
    const msg = generateWhatsAppMessage({
      schoolName: school?.name || "المدرسة الأهلية",
      studentName: student.user.fullName,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      eventType: "PAYMENT_RECEIPT",
      details: {
        receiptNumber,
        amount: data.amount,
        remainingBalance: remaining,
        currency: curr,
        paymentDate: today,
      },
    });

    await prisma.whatsAppMessageQueue.create({
      data: {
        tenantId,
        recipientPhone: student.guardianPhone,
        recipientName: student.guardianName,
        eventType: "PAYMENT_RECEIPT",
        messageText: msg,
        status: "QUEUED",
      },
    });
  }

  revalidatePath("/admin/payments");
  revalidatePath("/student/payments");
  return { success: true, receipt, receiptNumber, remainingBalance: remaining };
}

export async function getStudentPaymentHistory(studentId: string) {
  const session = await requireAuth();
  const tenantId = session.tenantId;

  return prisma.studentProfile.findUnique({
    where: { id: studentId, tenantId },
    include: {
      user: true,
      classRoom: true,
      section: true,
      paymentReceipts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
