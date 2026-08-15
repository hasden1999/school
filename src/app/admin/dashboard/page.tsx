import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function AdminDashboardPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const today = new Date().toISOString().split("T")[0];

  // 1. Fetch Key Metrics and Operations Data in Parallel
  const [
    totalStudents,
    totalTeachers,
    pendingLeaves,
    pendingReports,
    queuedWhatsApp,
    students,
    todayAttendance,
    school,
    recentReceipts,
    recentReports,
    recentLeaves,
  ] = await Promise.all([
    prisma.studentProfile.count({ where: { tenantId, registrationStatus: "ACTIVE" } }),
    prisma.user.count({ where: { tenantId, role: "TEACHER", active: true } }),
    prisma.leaveRequest.count({ where: { tenantId, status: "PENDING" } }),
    prisma.dailyReport.count({ where: { tenantId, status: "PENDING_APPROVAL" } }),
    prisma.whatsAppMessageQueue.count({ where: { tenantId, status: "QUEUED" } }),
    prisma.studentProfile.findMany({
      where: { tenantId, registrationStatus: "ACTIVE" },
      include: {
        paymentReceipts: true,
        documents: { where: { status: "MISSING", requirement: { isRequired: true } } },
      },
    }),
    prisma.attendanceRecord.findMany({
      where: { tenantId, date: today, periodNumber: 1 },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.paymentReceipt.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.dailyReport.findMany({
      where: { tenantId },
      include: {
        teacher: true,
        subject: true,
        classRoom: true,
        section: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.leaveRequest.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  // Tuition Calculation
  let totalTuitionTarget = 0;
  let totalCollected = 0;
  let missingDocsCount = 0;

  for (const s of students) {
    totalTuitionTarget += s.totalTuition;
    const paid = s.paymentReceipts.reduce((acc, r) => acc + r.amount, 0) + s.depositAmount;
    totalCollected += paid;
    if (s.documents.length > 0) missingDocsCount++;
  }

  const remainingTuition = totalTuitionTarget - totalCollected;
  const attendanceRate =
    totalStudents > 0
      ? Math.round(
          (todayAttendance.filter((a) => a.status === "PRESENT" || a.status === "ON_LEAVE").length /
            totalStudents) *
            100
        )
      : 100;

  return (
    <DashboardClient
      school={school}
      user={session}
      totalStudents={totalStudents}
      totalTeachers={totalTeachers}
      pendingLeaves={pendingLeaves}
      pendingReports={pendingReports}
      queuedWhatsApp={queuedWhatsApp}
      totalCollected={totalCollected}
      remainingTuition={remainingTuition}
      missingDocsCount={missingDocsCount}
      attendanceRate={attendanceRate}
      todayAttendance={todayAttendance}
      recentReceipts={recentReceipts}
      recentReports={recentReports}
      recentLeaves={recentLeaves}
    />
  );
}
