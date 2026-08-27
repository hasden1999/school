import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PermissionsClient } from "./PermissionsClient";

export const revalidate = 0;

export default async function PermissionsPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const users = await prisma.user.findMany({
    where: { tenantId },
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
  });

  return <PermissionsClient users={users} currentUser={session} />;
}
