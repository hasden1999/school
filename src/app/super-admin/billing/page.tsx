import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { SuperAdminBillingClient } from "./SuperAdminBillingClient";

export const revalidate = 0;

export default async function SuperAdminBillingPage() {
  await requireAuth(["SUPER_ADMIN"]);

  const payments = await prisma.platformPayment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tenant: true,
    },
  });

  return <SuperAdminBillingClient payments={payments} />;
}
