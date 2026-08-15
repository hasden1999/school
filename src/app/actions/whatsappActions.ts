"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getWhatsAppQueueList(statusFilter?: string) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  return prisma.whatsAppMessageQueue.findMany({
    where: {
      tenantId,
      ...(statusFilter && statusFilter !== "ALL" && { status: statusFilter }),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function processWhatsAppQueueAction() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  // Mark all queued as SENT (simulating Baileys worker)
  const result = await prisma.whatsAppMessageQueue.updateMany({
    where: {
      tenantId,
      status: "QUEUED",
    },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });

  revalidatePath("/admin/whatsapp");
  return { success: true, processedCount: result.count };
}
