"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { runNightlyDatabaseBackup } from "@/lib/cronEngine";
import { revalidatePath } from "next/cache";

export async function createDatabaseBackupAction() {
  const session = await requireAuth(["ADMIN"]);
  const report = await runNightlyDatabaseBackup(session.tenantId, session.id);
  revalidatePath("/admin/backup");
  return report;
}

export async function getEmergencyBundleData() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const [
    school,
    students,
    teachers,
    classRooms,
    sections,
    subjects,
    timetableSlots,
    gradeRecords,
    paymentReceipts,
    attendanceRecords,
    dailyReports,
    leaveRequests,
  ] = await Promise.all([
    // 1. Tenant info
    prisma.tenant.findUnique({ where: { id: tenantId } }),

    // 2. Students
    prisma.studentProfile.findMany({
      where: { tenantId },
      include: {
        user: true,
        classRoom: true,
        section: true,
        paymentReceipts: { orderBy: { createdAt: "desc" } },
        gradeRecords: { include: { subject: true }, orderBy: { subject: { orderIndex: "asc" } } },
        attendanceRecords: { orderBy: { date: "desc" }, take: 30 },
      },
      orderBy: [{ classRoom: { orderIndex: "asc" } }, { user: { fullName: "asc" } }],
    }),

    // 3. Teachers
    prisma.user.findMany({
      where: { tenantId, role: "TEACHER" },
      include: {
        teacherAssignments: {
          include: {
            classRoom: true,
            section: true,
            subject: true,
          },
        },
        teacherLeaves: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { fullName: "asc" },
    }),

    // 4. Classrooms
    prisma.classRoom.findMany({
      where: { tenantId },
      include: { sections: true },
      orderBy: { orderIndex: "asc" },
    }),

    // 5. Sections
    prisma.section.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    }),

    // 6. Subjects
    prisma.subject.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),

    // 7. Timetable
    prisma.timetableSlot.findMany({
      where: { tenantId },
      include: {
        classRoom: true,
        section: true,
        subject: true,
        teacher: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
    }),

    // 8. Grades
    prisma.gradeRecord.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
        subject: true,
      },
      orderBy: [{ student: { classRoom: { orderIndex: "asc" } } }, { subject: { orderIndex: "asc" } }],
    }),

    // 9. Financial Receipts
    prisma.paymentReceipt.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    // 10. Attendance
    prisma.attendanceRecord.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    }),

    // 11. Daily Reports
    prisma.dailyReport.findMany({
      where: { tenantId },
      include: {
        teacher: true,
        subject: true,
        classRoom: true,
        section: true,
      },
      orderBy: { date: "desc" },
    }),

    // 12. Leaves
    prisma.leaveRequest.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    school,
    generatedAt: new Date().toLocaleString("ar-IQ"),
    generatedIso: new Date().toISOString(),
    students,
    teachers,
    classRooms,
    sections,
    subjects,
    timetableSlots,
    gradeRecords,
    paymentReceipts,
    attendanceRecords,
    dailyReports,
    leaveRequests,
  };
}
