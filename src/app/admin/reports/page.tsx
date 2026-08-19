import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportsClient } from "./ReportsClient";

export default async function ReportsPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const [reports, classRooms, sections, students] = await Promise.all([
    prisma.dailyReport.findMany({
      where: { tenantId },
      include: {
        teacher: true,
        classRoom: true,
        section: true,
        subject: true,
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
    prisma.studentProfile.findMany({
      where: { tenantId, registrationStatus: "ACTIVE" },
      include: { user: true, classRoom: true, section: true },
      orderBy: [{ classRoom: { orderIndex: "asc" } }, { user: { fullName: "asc" } }],
    }),
  ]);

  return (
    <ReportsClient
      reports={reports}
      classRooms={classRooms}
      sections={sections}
      students={students}
    />
  );
}

