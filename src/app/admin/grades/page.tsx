import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GradesClient } from "./GradesClient";

export default async function GradesPage() {
  const session = await requireAuth(["ADMIN"]);
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
        gradeRecords: {
          include: { subject: true },
        },
      },
      orderBy: { user: { fullName: "asc" } },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  return (
    <GradesClient
      classRooms={classRooms}
      subjects={subjects}
      students={students}
      currency={school?.currency || "د.ع"}
      tenant={school}
    />
  );
}
