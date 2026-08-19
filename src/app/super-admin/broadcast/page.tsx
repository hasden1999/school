import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { SuperAdminBroadcastClient } from "./SuperAdminBroadcastClient";

export const revalidate = 0;

export default async function SuperAdminBroadcastPage() {
  await requireAuth(["SUPER_ADMIN"]);

  const broadcasts = await prisma.systemBroadcast.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return <SuperAdminBroadcastClient broadcasts={broadcasts} />;
}
