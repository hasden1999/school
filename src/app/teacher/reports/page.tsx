import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeacherReportsClient } from "./TeacherReportsClient";

export default async function TeacherReportsPage() {
  const session = await requireAuth(["TEACHER", "ADMIN"]);
  const tenantId = session.tenantId;

  const [assignments, reports] = await Promise.all([
    prisma.teacherAssignment.findMany({
      where: { tenantId, teacherId: session.id },
      include: {
        classRoom: true,
        section: true,
        subject: true,
      },
    }),
    prisma.dailyReport.findMany({
      where: { tenantId, teacherId: session.id },
      include: {
        classRoom: true,
        section: true,
        subject: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <TeacherReportsClient assignments={assignments} reports={reports} />;
}
