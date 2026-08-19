"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Get all subjects for the school
 */
export async function getSchoolSubjectsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  try {
    const subjects = await prisma.subject.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { orderIndex: "asc" },
      include: {
        teacherAssignments: {
          include: {
            classRoom: true,
            section: true,
            teacher: true,
          },
        },
        gradeRecords: {
          select: { id: true },
        },
      },
    });

    return { success: true, subjects };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل جلب المواد الدراسية" };
  }
}

/**
 * Create a new subject
 */
export async function createSubjectAction(data: {
  name: string;
  code?: string;
  orderIndex?: number;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const tenantId = session.tenantId;
  const name = data.name.trim();

  if (!name) {
    return { success: false, error: "يرجى كتابة اسم المادة الدراسية" };
  }

  const code = data.code?.trim() || name.replace(/\s+/g, "_") + "_" + Math.floor(Math.random() * 1000);
  const orderIndex = Number(data.orderIndex) || 0;

  try {
    const existing = await prisma.subject.findFirst({
      where: { tenantId, name },
    });

    if (existing) {
      return { success: false, error: "توجد مادة مسجلة بهذا الاسم مسبقاً" };
    }

    const subject = await prisma.subject.create({
      data: {
        tenantId,
        name,
        code,
        orderIndex,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/grades");
    revalidatePath("/admin/schedule");

    return { success: true, subject };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل إنشاء المادة الدراسية" };
  }
}

/**
 * Update an existing subject
 */
export async function updateSubjectAction(
  subjectId: string,
  data: {
    name?: string;
    code?: string;
    orderIndex?: number;
  }
) {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const tenantId = session.tenantId;

  try {
    const subject = await prisma.subject.update({
      where: { id: subjectId, tenantId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.code ? { code: data.code.trim() } : {}),
        ...(data.orderIndex !== undefined ? { orderIndex: Number(data.orderIndex) } : {}),
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/grades");
    revalidatePath("/admin/schedule");

    return { success: true, subject };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل تعديل المادة" };
  }
}

/**
 * Delete a subject
 */
export async function deleteSubjectAction(subjectId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const tenantId = session.tenantId;

  try {
    const gradesCount = await prisma.gradeRecord.count({
      where: { tenantId, subjectId },
    });

    if (gradesCount > 0) {
      return {
        success: false,
        error: `لا يمكن حذف هذه المادة لوجود (${gradesCount}) سجل درجات مرتبط بها.`,
      };
    }

    await prisma.teacherAssignment.deleteMany({
      where: { tenantId, subjectId },
    });

    await prisma.timetableSlot.deleteMany({
      where: { tenantId, subjectId },
    });

    await prisma.subject.delete({
      where: { id: subjectId, tenantId },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/grades");
    revalidatePath("/admin/schedule");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل حذف المادة" };
  }
}
