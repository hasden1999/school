import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentEvaluationClient } from "./StudentEvaluationClient";

export default async function StudentEvaluationPage() {
  const session = await requireAuth(["STUDENT", "ADMIN"]);
  const tenantId = session.tenantId;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
  });

  if (!profile) return null;

  // Find active exams for this student's class and section
  const exams = await prisma.teacherEvaluationExam.findMany({
    where: {
      tenantId,
      classRoomId: profile.classRoomId,
      sectionId: profile.sectionId,
      isActive: true,
    },
    include: {
      subject: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <StudentEvaluationClient exams={exams} />;
}
