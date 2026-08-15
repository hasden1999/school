import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentDocumentsClient } from "./StudentDocumentsClient";

export default async function StudentDocumentsPage() {
  const session = await requireAuth(["STUDENT", "ADMIN"]);
  const tenantId = session.tenantId;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
    include: {
      documents: {
        include: { requirement: true },
      },
    },
  });

  if (!profile) return null;

  return <StudentDocumentsClient documents={profile.documents} />;
}
