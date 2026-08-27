import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentGradesClient } from "./StudentGradesClient";
import { getFullClassGradesForStudentAction } from "@/app/actions/permissionsPolicyActions";

export const revalidate = 0;

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

  // Check if student or classroom has permission to view full class roster/grades
  const classGradesData = await getFullClassGradesForStudentAction(session.id);

  return (
    <StudentGradesClient
      student={student}
      classGradesData={classGradesData}
    />
  );
}
