import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BackupClient } from "./BackupClient";

export default async function BackupPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const records = await prisma.backupRecord.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return <BackupClient records={records} />;
}
