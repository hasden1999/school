"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import { createInAppNotification } from "@/lib/notificationEngine";
import { generateAtomicReceiptNumber } from "@/lib/atomicSequence";
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

  if (!hasPermission(session, "MANAGE_PAYMENTS")) {
    return { error: "ليس لديك صلاحية تسجيل وقبض الدفعات المالية في المنظومة." };
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: data.studentId, tenantId },
    include: {
      user: true,
      paymentReceipts: true,
    },
  });

  if (!student) return { error: "الطالب غير موجود" };

  const school = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const curr = school?.currency || "د.ع";

  // Calculate current paid & remaining balance BEFORE new payment
  const alreadyPaid = student.paymentReceipts.reduce((sum, r) => sum + r.amount, 0) + student.depositAmount;
  const currentRemaining = Math.max(0, student.totalTuition - alreadyPaid);
  const paymentAmount = Number(data.amount);

  if (paymentAmount <= 0) {
    return { error: "يرجى إدخال مبلغ دفع صحيح أكبر من الصفر." };
  }

  if (paymentAmount > currentRemaining) {
    return {
      error: `⚠️ تنبيه مالي: المبلغ المدخل (${paymentAmount.toLocaleString("ar-IQ")} ${curr}) يتجاوز المبلغ المتبقي على الطالب (${currentRemaining.toLocaleString("ar-IQ")} ${curr}). الحد الأقصى المسموح بقبضه هو (${currentRemaining.toLocaleString("ar-IQ")} ${curr}).`,
    };
  }

  const receiptNumber = await generateAtomicReceiptNumber(tenantId, "2025");
  const today = new Date().toISOString().split("T")[0];

  const receipt = await prisma.paymentReceipt.create({
    data: {
      tenantId,
      studentId: data.studentId,
      receiptNumber,
      amount: paymentAmount,
      paymentDate: today,
      paymentMethod: data.paymentMethod,
      notes: data.notes?.trim(),
      receivedByUserId: session.id,
    },
  });

  // Calculate new balance
  const remaining = currentRemaining - paymentAmount;

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
