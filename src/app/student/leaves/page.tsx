import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentLeavesClient } from "./StudentLeavesClient";

export default async function StudentLeavesPage() {
  const session = await requireAuth(["STUDENT", "ADMIN"]);
  const tenantId = session.tenantId;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
  });

  if (!profile) return null;

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      tenantId,
      studentId: profile.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return <StudentLeavesClient leaves={leaves} />;
}
