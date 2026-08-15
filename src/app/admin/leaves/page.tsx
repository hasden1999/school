import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeavesClient } from "./LeavesClient";

export default async function LeavesPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const leaves = await prisma.leaveRequest.findMany({
    where: { tenantId },
    include: {
      student: {
        include: {
          user: true,
          classRoom: true,
          section: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <LeavesClient leaves={leaves} />;
}
