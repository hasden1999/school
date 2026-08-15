import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeachersClient } from "./TeachersClient";

export default async function TeachersPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const [teachers, classRooms, sections, subjects, school] = await Promise.all([
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

  return (
    <TeachersClient
      teachers={teachers}
      classRooms={classRooms}
      sections={sections}
      subjects={subjects}
      currency={school?.currency || "د.ع"}
    />
  );
}
