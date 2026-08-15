import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentsClient } from "./PaymentsClient";

export default async function PaymentsPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const [students, classRooms, school] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { tenantId, registrationStatus: "ACTIVE" },
      include: {
        user: true,
        classRoom: true,
        section: true,
        paymentReceipts: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.classRoom.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  return (
    <PaymentsClient
      students={students}
      classRooms={classRooms}
      currency={school?.currency || "د.ع"}
      tenant={school}
    />
  );
}
