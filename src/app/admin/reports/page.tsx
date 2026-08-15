import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportsClient } from "./ReportsClient";

export default async function ReportsPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const reports = await prisma.dailyReport.findMany({
    where: { tenantId },
    include: {
      teacher: true,
      classRoom: true,
      section: true,
      subject: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <ReportsClient reports={reports} />;
}
