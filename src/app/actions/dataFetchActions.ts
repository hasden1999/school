"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Fetch students with all relations for offline caching
 */
export async function fetchStudentsDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };
  const tenantId = session.tenantId;

  const [students, classRooms, sections, school] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { tenantId },
      include: {
        user: true,
        classRoom: true,
        section: true,
        documents: { include: { requirement: true } },
        paymentReceipts: true,
        gradeRecords: { include: { subject: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.classRoom.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.section.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  return {
    success: true,
    students,
    classRooms,
    sections,
    currency: school?.currency || "د.ع",
    session,
    school,
  };
}

/**
 * Fetch attendance page data (classrooms + sections)
 */
export async function fetchAttendanceDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };
  const tenantId = session.tenantId;

  const [classRooms, sections] = await Promise.all([
    prisma.classRoom.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.section.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    }),
  ]);

  return { success: true, classRooms, sections, session };
}

/**
 * Fetch grades page data
 */
export async function fetchGradesDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };
  const tenantId = session.tenantId;

  const [classRooms, subjects, students, school] = await Promise.all([
    prisma.classRoom.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.subject.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.studentProfile.findMany({
      where: { tenantId, registrationStatus: "ACTIVE" },
      include: {
        user: true,
        classRoom: true,
        section: true,
        gradeRecords: { include: { subject: true } },
      },
      orderBy: { user: { fullName: "asc" } },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  return {
    success: true,
    classRooms,
    subjects,
    students,
    currency: school?.currency || "د.ع",
    school,
    session,
  };
}

/**
 * Fetch payments page data
 */
export async function fetchPaymentsDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };
  const tenantId = session.tenantId;

  const [students, classRooms, school] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { tenantId, registrationStatus: "ACTIVE" },
      include: {
        user: true,
        classRoom: true,
        section: true,
        paymentReceipts: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.classRoom.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  return {
    success: true,
    students,
    classRooms,
    currency: school?.currency || "د.ع",
    school,
    session,
  };
}

/**
 * Fetch teachers page data
 */
export async function fetchTeachersDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };
  const tenantId = session.tenantId;

  const [teachers, classRooms, sections, subjects, school] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId, role: "TEACHER" },
      include: {
        teacherAssignments: {
          include: { classRoom: true, section: true, subject: true },
        },
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.classRoom.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.section.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  return {
    success: true,
    teachers,
    classRooms,
    sections,
    subjects,
    currency: school?.currency || "د.ع",
    school,
    session,
  };
}

/**
 * Fetch dashboard data
 */
export async function fetchDashboardDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };
  const tenantId = session.tenantId;
  const today = new Date().toISOString().split("T")[0];

  const [
    totalStudents, totalTeachers, pendingLeaves, pendingReports,
    queuedWhatsApp, tuitionAggregate, paymentsAggregate,
    missingDocsCount, todayAttendance, school,
    recentReceipts, recentReports, recentLeaves,
  ] = await Promise.all([
    prisma.studentProfile.count({ where: { tenantId, registrationStatus: "ACTIVE" } }),
    prisma.user.count({ where: { tenantId, role: "TEACHER", active: true } }),
    prisma.leaveRequest.count({ where: { tenantId, status: "PENDING" } }),
    prisma.dailyReport.count({ where: { tenantId, status: "PENDING_APPROVAL" } }),
    prisma.whatsAppMessageQueue.count({ where: { tenantId, status: "QUEUED" } }),
    prisma.studentProfile.aggregate({
      where: { tenantId, registrationStatus: "ACTIVE" },
      _sum: { totalTuition: true, depositAmount: true },
    }),
    prisma.paymentReceipt.aggregate({ where: { tenantId }, _sum: { amount: true } }),
    prisma.studentDocument.count({
      where: { tenantId, status: "MISSING", requirement: { isRequired: true }, student: { registrationStatus: "ACTIVE" } },
    }),
    prisma.attendanceRecord.findMany({
      where: { tenantId, date: today, periodNumber: 1 },
      include: { student: { include: { user: true, classRoom: true, section: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.paymentReceipt.findMany({
      where: { tenantId },
      include: { student: { include: { user: true, classRoom: true, section: true } } },
      orderBy: { createdAt: "desc" }, take: 6,
    }),
    prisma.dailyReport.findMany({
      where: { tenantId },
      include: { teacher: true, subject: true, classRoom: true, section: true },
      orderBy: { createdAt: "desc" }, take: 6,
    }),
    prisma.leaveRequest.findMany({
      where: { tenantId },
      include: { student: { include: { user: true, classRoom: true, section: true } } },
      orderBy: { createdAt: "desc" }, take: 6,
    }),
  ]);

  const totalTuitionTarget = tuitionAggregate._sum.totalTuition || 0;
  const totalDeposits = tuitionAggregate._sum.depositAmount || 0;
  const totalReceiptsAmount = paymentsAggregate._sum.amount || 0;
  const totalCollected = totalDeposits + totalReceiptsAmount;
  const remainingTuition = Math.max(0, totalTuitionTarget - totalCollected);
  const presentOrLeaveCount = todayAttendance.filter(
    (a) => a.status === "PRESENT" || a.status === "ON_LEAVE"
  ).length;
  const attendanceRate = totalStudents > 0
    ? Math.round((presentOrLeaveCount / totalStudents) * 100) : 100;

  return {
    success: true,
    school, session,
    totalStudents, totalTeachers, pendingLeaves, pendingReports,
    queuedWhatsApp, totalCollected, remainingTuition,
    missingDocsCount, attendanceRate, todayAttendance,
    recentReceipts, recentReports, recentLeaves,
  };
}

/**
 * Fetch admin layout data (session + school info)
 */
export async function fetchAdminLayoutDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: "غير مصرح" };

  const school = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  });

  return {
    success: true,
    session,
    school,
    schoolName: school?.name,
  };
}
