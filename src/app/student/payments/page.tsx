import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentPaymentsClient } from "./StudentPaymentsClient";

export default async function StudentPaymentsPage() {
  const session = await requireAuth(["STUDENT", "ADMIN"]);
  const tenantId = session.tenantId;

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      classRoom: true,
      section: true,
      tenant: true,
      paymentReceipts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const school = await prisma.tenant.findUnique({ where: { id: tenantId } });

  return <StudentPaymentsClient student={student} currency={school?.currency || "د.ع"} />;
}
