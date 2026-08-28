import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDayKey } from "@/lib/attendanceLogic";
import { StudentDashboardClient } from "./StudentDashboardClient";

export const revalidate = 0;

export default async function StudentDashboardPage() {
  const session = await requireAuth(["STUDENT", "ADMIN"]);
  const tenantId = session.tenantId;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      classRoom: true,
      section: true,
      paymentReceipts: true,
      tenant: true,
      documents: {
        include: { requirement: true },
      },
      gradeRecords: {
        include: { subject: true },
      },
    },
  });

  if (!profile) {
    return (
      <div className="text-center py-16 card-surface text-slate-500 font-cairo">
        الملف الشخصي للطالب غير موجود.
      </div>
    );
  }

  // Parse student overrides
  let isClassRep = false;
  let canViewClassGrades = false;
  if (profile.user?.permissionsJson) {
    try {
      const parsed = JSON.parse(profile.user.permissionsJson);
      isClassRep = !!parsed.isClassRepresentative;
      canViewClassGrades = !!parsed.allowViewClassGrades;
    } catch {}
  }

  const todayKey = getCurrentDayKey();

  // Fetch full week timetable slots for this student's classroom and section
  const allWeekSlots = await prisma.timetableSlot.findMany({
    where: {
      tenantId,
      classRoomId: profile.classRoomId,
      sectionId: profile.sectionId,
    },
    include: {
      subject: true,
      teacher: true,
    },
    orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
  });

  const todaySlots = allWeekSlots.filter((s) => s.dayOfWeek === todayKey);

  // Approved daily reports & homework
  const recentReports = await prisma.dailyReport.findMany({
    where: {
      tenantId,
      classRoomId: profile.classRoomId,
      sectionId: profile.sectionId,
      status: "APPROVED",
    },
    include: {
      subject: true,
      teacher: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalPaid = profile.paymentReceipts.reduce((sum, r) => sum + r.amount, 0) + profile.depositAmount;
  const remainingTuition = profile.totalTuition - totalPaid;
  const schoolPhone = profile.tenant?.phone || "07700000000";

  return (
    <StudentDashboardClient
      session={session}
      profile={profile}
      allWeekSlots={allWeekSlots}
      todaySlots={todaySlots}
      recentReports={recentReports}
      totalPaid={totalPaid}
      remainingTuition={remainingTuition}
      schoolPhone={schoolPhone}
      isClassRep={isClassRep}
      canViewClassGrades={canViewClassGrades}
      todayKey={todayKey}
    />
  );
}
