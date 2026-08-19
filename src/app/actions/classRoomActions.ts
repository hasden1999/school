"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Get all classrooms with sections and student count
 */
export async function getClassroomsAndSectionsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const tenantId = session.tenantId;

  try {
    const classRooms = await prisma.classRoom.findMany({
      where: { tenantId },
      include: {
        sections: {
          orderBy: { name: "asc" },
        },
        studentProfiles: {
          select: { id: true },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    return { success: true, classRooms };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل جلب الصفوف والشعب" };
  }
}

/**
 * Create a new classroom with an optional initial section
 */
export async function createClassRoomAction(data: {
  name: string;
  code?: string;
  annualTuition?: number;
  orderIndex?: number;
  isGraduatingClass?: boolean;
  initialSectionName?: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const tenantId = session.tenantId;

  if (!data.name || !data.name.trim()) {
    return { success: false, error: "يرجى كتابة اسم الصف الدراسي" };
  }

  const name = data.name.trim();
  const code = data.code?.trim() || name.replace(/\s+/g, "_");
  const annualTuition = Number(data.annualTuition) || 0;
  const orderIndex = Number(data.orderIndex) || 0;
  const initialSectionName = data.initialSectionName?.trim() || "أ";

  try {
    const existing = await prisma.classRoom.findFirst({
      where: { tenantId, name },
    });

    if (existing) {
      return { success: false, error: "يوجد صف دراسي مسجل بهذا الاسم مسبقاً" };
    }

    const classRoom = await prisma.classRoom.create({
      data: {
        tenantId,
        name,
        code,
        annualTuition,
        orderIndex,
        isGraduatingClass: !!data.isGraduatingClass,
        sections: {
          create: {
            tenantId,
            name: initialSectionName,
          },
        },
      },
      include: { sections: true },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/grades");

    return { success: true, classRoom };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل إنشاء الصف الدراسي" };
  }
}

/**
 * Update an existing classroom
 */
export async function updateClassRoomAction(
  classRoomId: string,
  data: {
    name?: string;
    code?: string;
    annualTuition?: number;
    orderIndex?: number;
    isGraduatingClass?: boolean;
  }
) {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const tenantId = session.tenantId;

  try {
    const classRoom = await prisma.classRoom.update({
      where: { id: classRoomId, tenantId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.code ? { code: data.code.trim() } : {}),
        ...(data.annualTuition !== undefined ? { annualTuition: Number(data.annualTuition) } : {}),
        ...(data.orderIndex !== undefined ? { orderIndex: Number(data.orderIndex) } : {}),
        ...(data.isGraduatingClass !== undefined ? { isGraduatingClass: !!data.isGraduatingClass } : {}),
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/grades");

    return { success: true, classRoom };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل تعديل بيانات الصف" };
  }
}

/**
 * Delete a classroom if it has no registered students
 */
export async function deleteClassRoomAction(classRoomId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const tenantId = session.tenantId;

  try {
    const studentCount = await prisma.studentProfile.count({
      where: { tenantId, classRoomId },
    });

    if (studentCount > 0) {
      return {
        success: false,
        error: `لا يمكن حذف هذا الصف لوجود (${studentCount}) طالب مسجلين فيه. يرجى نقل الطلاب أولاً.`,
      };
    }

    // Delete related sections first
    await prisma.section.deleteMany({
      where: { tenantId, classRoomId },
    });

    await prisma.classRoom.delete({
      where: { id: classRoomId, tenantId },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/grades");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل حذف الصف الدراسي" };
  }
}

/**
 * Add a new section to a classroom
 */
export async function createSectionAction(data: {
  classRoomId: string;
  name: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const tenantId = session.tenantId;

  if (!data.classRoomId || !data.name || !data.name.trim()) {
    return { success: false, error: "يرجى تحديد الصف وكتابة اسم الشعبة (مثال: أ أو ب)" };
  }

  const name = data.name.trim();

  try {
    const existing = await prisma.section.findFirst({
      where: {
        tenantId,
        classRoomId: data.classRoomId,
        name,
      },
    });

    if (existing) {
      return { success: false, error: "توجد شعبة مسجلة بهذا الاسم داخل هذا الصف مسبقاً" };
    }

    const section = await prisma.section.create({
      data: {
        tenantId,
        classRoomId: data.classRoomId,
        name,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/grades");

    return { success: true, section };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل إضافة الشعبة" };
  }
}

/**
 * Delete a section if it has no registered students
 */
export async function deleteSectionAction(sectionId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const tenantId = session.tenantId;

  try {
    const studentCount = await prisma.studentProfile.count({
      where: { tenantId, sectionId },
    });

    if (studentCount > 0) {
      return {
        success: false,
        error: `لا يمكن حذف الشعبة لوجود (${studentCount}) طالب مسجلين فيها.`,
      };
    }

    await prisma.section.delete({
      where: { id: sectionId, tenantId },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/grades");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل حذف الشعبة" };
  }
}
