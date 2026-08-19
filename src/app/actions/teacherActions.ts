"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
import { generateUniqueFiveLetterUsername, generateFiveLetterPasscode } from "@/lib/credentialGenerator";
import { revalidatePath } from "next/cache";

export async function createTeacherAction(data: {
  fullName: string;
  phone?: string;
  monthlySalary?: number;
  assignments: Array<{
    classRoomId: string;
    sectionId: string;
    subjectId: string;
  }>;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

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
      phone: data.phone?.trim(),
      role: "TEACHER",
      monthlySalary: data.monthlySalary ? Number(data.monthlySalary) : 0,
      mustChangePassword: true,
    },
  });

  // Create assignments
  for (const assign of data.assignments) {
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

  revalidatePath("/admin/teachers");
  return { success: true, teacher, username, rawPassword };
}

export async function updateTeacherSalaryAction(teacherId: string, monthlySalary: number) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const teacher = await prisma.user.update({
    where: { id: teacherId, tenantId },
    data: { monthlySalary: Number(monthlySalary) },
  });

  revalidatePath("/admin/teachers");
  return { success: true, teacher };
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
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update user record
      await tx.user.update({
        where: { id: teacherId, tenantId },
        data: {
          fullName: data.fullName.trim(),
          phone: data.phone?.trim(),
          monthlySalary: data.monthlySalary ? Number(data.monthlySalary) : 0,
        },
      });

      // 2. Update assignments if provided
      if (data.assignments) {
        await tx.teacherAssignment.deleteMany({
          where: { tenantId, teacherId },
        });

        for (const assign of data.assignments) {
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
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/schedule");

    return { success: true, message: "تم تعديل بيانات المعلم بنجاح" };
  } catch (e: any) {
    return { success: false, error: e.message || "فشل تعديل بيانات المعلم" };
  }
}

export async function deleteTeacherAction(teacherId: string) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  try {
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
  const session = await requireAuth(["ADMIN"]);
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

