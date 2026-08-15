"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
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

  // Generate username: t.firstname.3digits
  const cleanFirst = data.fullName.trim().split(" ")[0].toLowerCase().replace(/[^\u0621-\u064A0-9a-z]/g, "");
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const username = `t.${cleanFirst || "teach"}${randomSuffix}`;

  const rawPassword = Math.random().toString(36).slice(-8);
  const passwordHash = await hashPassword(rawPassword);

  const teacher = await prisma.user.create({
    data: {
      tenantId,
      username,
      fullName: data.fullName.trim(),
      passwordHash,
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

  await prisma.user.update({
    where: { id: teacherId, tenantId },
    data: { monthlySalary: Number(monthlySalary) },
  });

  revalidatePath("/admin/teachers");
  return { success: true };
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
