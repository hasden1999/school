import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  });

  return <SettingsClient initialTenant={tenant} />;
}
