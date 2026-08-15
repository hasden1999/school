import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WhatsAppCenterClient } from "./WhatsAppCenterClient";

export default async function WhatsAppPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const queue = await prisma.whatsAppMessageQueue.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return <WhatsAppCenterClient queue={queue} />;
}
