import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminEvaluationReports } from "@/app/actions/evaluationActions";
import { EvaluationClient } from "./EvaluationClient";

export default async function EvaluationPage() {
  const session = await requireAuth(["ADMIN"]); // STRICT ADMIN ONLY
  const tenantId = session.tenantId;

  const [exams, teachers, classRooms, sections, subjects] = await Promise.all([
    getAdminEvaluationReports(),
    prisma.user.findMany({
      where: { tenantId, role: "TEACHER" },
      select: { id: true, fullName: true },
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
  ]);

  return (
    <EvaluationClient
      exams={exams}
      teachers={teachers}
      classRooms={classRooms}
      sections={sections}
      subjects={subjects}
    />
  );
}
