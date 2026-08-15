import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentGradesClient } from "./StudentGradesClient";

export default async function StudentGradesPage() {
  const session = await requireAuth(["STUDENT", "ADMIN"]);
  const tenantId = session.tenantId;

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      classRoom: true,
      section: true,
      tenant: true,
      gradeRecords: {
        include: { subject: true },
        orderBy: { subject: { orderIndex: "asc" } },
      },
    },
  });

  return <StudentGradesClient student={student} />;
}
