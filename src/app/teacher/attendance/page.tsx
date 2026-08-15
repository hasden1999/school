import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeacherAttendanceClient } from "./TeacherAttendanceClient";

export default async function TeacherAttendancePage() {
  const session = await requireAuth(["TEACHER", "ADMIN"]);
  const tenantId = session.tenantId;

  const assignments = await prisma.teacherAssignment.findMany({
    where: { tenantId, teacherId: session.id },
    include: {
      classRoom: true,
      section: true,
      subject: true,
    },
  });

  return <TeacherAttendanceClient assignments={assignments} />;
}
