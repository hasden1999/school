import { requireAuth } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["ADMIN"]);
  const school = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  });

  return (
    <AdminLayoutClient user={session} schoolName={school?.name} tenant={school}>
      {children}
    </AdminLayoutClient>
  );
}
