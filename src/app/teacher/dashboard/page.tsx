import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDayKey } from "@/lib/attendanceLogic";
import { TeacherDashboardClient } from "./TeacherDashboardClient";

export const revalidate = 0;

export default async function TeacherDashboardPage() {
  const session = await requireAuth(["TEACHER", "ADMIN"]);
  const tenantId = session.tenantId;

  const todayKey = getCurrentDayKey();

  // Fetch teacher's assigned subjects, all-week timetable slots, and daily reports
  const [assignments, allWeekSlots, reports] = await Promise.all([
    prisma.teacherAssignment.findMany({
      where: { tenantId, teacherId: session.id },
      include: {
        classRoom: true,
        section: true,
        subject: true,
      },
    }),
    prisma.timetableSlot.findMany({
      where: { tenantId, teacherId: session.id },
      include: {
        classRoom: true,
        section: true,
        subject: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
    }),
    prisma.dailyReport.findMany({
      where: { tenantId, teacherId: session.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const todaySlots = allWeekSlots.filter((s) => s.dayOfWeek === todayKey);

  return (
    <TeacherDashboardClient
      session={session}
      assignments={assignments}
      allWeekSlots={allWeekSlots}
      todaySlots={todaySlots}
      reports={reports}
      todayKey={todayKey}
    />
  );
}
