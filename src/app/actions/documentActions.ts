"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateWhatsAppMessage } from "@/lib/whatsappEngine";
import { revalidatePath } from "next/cache";

export async function updateStudentDocumentStatusAction(data: {
  studentDocId: string;
  status: "MISSING" | "UPLOADED" | "VERIFIED";
  fileUrl?: string;
  notes?: string;
}) {
  const session = await requireAuth(["ADMIN", "STUDENT"]);
  const tenantId = session.tenantId;

  await prisma.studentDocument.update({
    where: { id: data.studentDocId, tenantId },
    data: {
      status: data.status,
      fileUrl: data.fileUrl,
      notes: data.notes,
    },
  });

  revalidatePath("/admin/students");
  revalidatePath("/student/documents");
  return { success: true };
}

export async function sendMissingDocsWhatsAppRemindersAction() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;
  const school = await prisma.tenant.findUnique({ where: { id: tenantId } });

  const studentsWithMissingDocs = await prisma.studentProfile.findMany({
    where: {
      tenantId,
      registrationStatus: "ACTIVE",
      documents: {
        some: {
          status: "MISSING",
          requirement: { isRequired: true },
        },
      },
    },
    include: {
      user: true,
      documents: {
        where: { status: "MISSING" },
        include: { requirement: true },
      },
    },
  });

  let count = 0;
  for (const student of studentsWithMissingDocs) {
    if (student.guardianPhone) {
      const missingList = student.documents.map((d) => d.requirement.title);
      const msg = generateWhatsAppMessage({
        schoolName: school?.name || "المدرسة الأهلية",
        studentName: student.user.fullName,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        eventType: "MISSING_DOCS",
        details: { missingList },
      });

      await prisma.whatsAppMessageQueue.create({
        data: {
          tenantId,
          recipientPhone: student.guardianPhone,
          recipientName: student.guardianName,
          eventType: "MISSING_DOCS",
          messageText: msg,
          status: "QUEUED",
        },
      });
      count++;
    }
  }

  revalidatePath("/admin/whatsapp");
  return { success: true, count };
}
