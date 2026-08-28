"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { generateUniqueFiveLetterUsername, generateFiveLetterPasscode } from "@/lib/credentialGenerator";
import { revalidatePath } from "next/cache";

export async function createTeacherAction(data: {
  fullName: string;
  phone?: string;
  monthlySalary?: number;
  assignments?: Array<{
    classRoomId: string;
    sectionId: string;
    subjectId: string;
  }>;
}) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN", "VICE_PRINCIPAL", "STAFF"]);
    if (!hasPermission(session, "MANAGE_TEACHERS")) {
      return { success: false, error: "ليس لديك صلاحية لإضافة معلمين جدد" };
    }

    const tenantId = session.tenantId;

    if (!data.fullName || !data.fullName.trim()) {
      return { success: false, error: "يرجى كتابة الاسم الثلاثي الكامل للمعلم" };
    }

    // 1. Generate unique 5 distinct English letters username
    const username = await generateUniqueFiveLetterUsername(tenantId);

    // 2. Generate 5 distinct English letters passcode
    const rawPassword = generateFiveLetterPasscode();
    const passwordHash = await hashPassword(rawPassword);

    const teacher = await prisma.user.create({
      data: {
        tenantId,
        username,
        fullName: data.fullName.trim(),
        passwordHash,
        plainPasscode: rawPassword,
        phone: data.phone?.trim() || null,
        role: "TEACHER",
        monthlySalary: data.monthlySalary ? Number(data.monthlySalary) : 0,
        mustChangePassword: false,
      },
    });

    // Create assignments if valid
    if (data.assignments && Array.isArray(data.assignments)) {
      for (const assign of data.assignments) {
        if (assign.classRoomId && assign.sectionId && assign.subjectId) {
          await prisma.teacherAssignment.create({
            data: {
              tenantId,
              teacherId: teacher.id,
              classRoomId: assign.classRoomId,
              sectionId: assign.sectionId,
              subjectId: assign.subjectId,
            },
          });
        }
      }
    }

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/schedule");
    revalidatePath("/admin/dashboard");

    return { success: true, teacher, username, rawPassword };
  } catch (err: any) {
    console.error("createTeacherAction error:", err);
    return { success: false, error: err.message || "حدث خطأ أثناء إضافة المعلم" };
  }
}

export async function updateTeacherSalaryAction(teacherId: string, monthlySalary: number) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN", "VICE_PRINCIPAL", "ACCOUNTANT"]);
    if (!hasPermission(session, "MANAGE_TEACHERS") && !hasPermission(session, "MANAGE_PAYMENTS")) {
      return { success: false, error: "ليس لديك صلاحية لتعديل رواتب الكادر" };
    }

    const tenantId = session.tenantId;

    const teacher = await prisma.user.update({
      where: { id: teacherId, tenantId },
      data: { monthlySalary: Number(monthlySalary) },
    });

    revalidatePath("/admin/teachers");
    return { success: true, teacher };
  } catch (err: any) {
    return { success: false, error: err.message || "فشل تعديل الراتب" };
  }
}

export async function updateTeacherAction(
  teacherId: string,
  data: {
    fullName: string;
    phone?: string;
    monthlySalary?: number;
    assignments?: Array<{
      classRoomId: string;
      sectionId: string;
      subjectId: string;
    }>;
  }
) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN", "VICE_PRINCIPAL", "STAFF"]);
    if (!hasPermission(session, "MANAGE_TEACHERS")) {
      return { success: false, error: "ليس لديك صلاحية لتعديل بيانات المعلم" };
    }

    const tenantId = session.tenantId;

    await prisma.$transaction(async (tx) => {
      // 1. Update user record
      await tx.user.update({
        where: { id: teacherId, tenantId },
        data: {
          fullName: data.fullName.trim(),
          phone: data.phone?.trim() || null,
          monthlySalary: data.monthlySalary ? Number(data.monthlySalary) : 0,
        },
      });

      // 2. Update assignments if provided
      if (data.assignments && Array.isArray(data.assignments)) {
        await tx.teacherAssignment.deleteMany({
          where: { tenantId, teacherId },
        });

        for (const assign of data.assignments) {
          if (assign.classRoomId && assign.sectionId && assign.subjectId) {
            await tx.teacherAssignment.create({
              data: {
                tenantId,
                teacherId,
                classRoomId: assign.classRoomId,
                sectionId: assign.sectionId,
                subjectId: assign.subjectId,
              },
            });
          }
        }
      }
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/schedule");

    return { success: true, message: "تم تعديل بيانات المعلم بنجاح" };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل تعديل بيانات المعلم" };
  }
}

export async function deleteTeacherAction(teacherId: string) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!hasPermission(session, "MANAGE_TEACHERS")) {
      return { success: false, error: "ليس لديك صلاحية لحذف المعلم" };
    }

    const tenantId = session.tenantId;

    await prisma.$transaction(async (tx) => {
      await tx.teacherAssignment.deleteMany({ where: { tenantId, teacherId } });
      await tx.timetableSlot.deleteMany({ where: { tenantId, teacherId } });
      await tx.teacherLeave.deleteMany({ where: { tenantId, teacherId } });
      await tx.user.delete({ where: { id: teacherId, tenantId } });
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/schedule");

    return { success: true, message: "تم حذف المعلم وسجلاته بنجاح" };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل حذف المعلم" };
  }
}

export async function getTeachersList() {
  const session = await requireAuth(["ADMIN", "SUPER_ADMIN", "VICE_PRINCIPAL", "STAFF"]);
  const tenantId = session.tenantId;

  return prisma.user.findMany({
    where: { tenantId, role: "TEACHER" },
    include: {
      teacherAssignments: {
        include: {
          classRoom: true,
          section: true,
          subject: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
  });
}
