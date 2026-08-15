import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "./StudentsClient";

export default async function StudentsPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const [students, classRooms, sections, school] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { tenantId },
      include: {
        user: true,
        classRoom: true,
        section: true,
        documents: {
          include: { requirement: true },
        },
        paymentReceipts: true,
        gradeRecords: {
          include: { subject: true },
        },
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

  return (
    <StudentsClient
      students={students}
      classRooms={classRooms}
      sections={sections}
      currency={school?.currency || "د.ع"}
    />
  );
}
