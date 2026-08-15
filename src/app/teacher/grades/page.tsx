import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeacherGradesClient } from "./TeacherGradesClient";

export default async function TeacherGradesPage() {
  const session = await requireAuth(["TEACHER", "ADMIN"]);
  const tenantId = session.tenantId;

  const [assignments, students] = await Promise.all([
    prisma.teacherAssignment.findMany({
      where: { tenantId, teacherId: session.id },
      include: {
        classRoom: true,
        section: true,
        subject: true,
      },
    }),
    prisma.studentProfile.findMany({
      where: { tenantId, registrationStatus: "ACTIVE" },
      include: {
        user: true,
        gradeRecords: true,
      },
      orderBy: { user: { fullName: "asc" } },
    }),
  ]);

  return <TeacherGradesClient assignments={assignments} students={students} />;
}
