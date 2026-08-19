import { requireAuth } from "@/lib/auth";
import { SuperAdminLayoutClient } from "@/components/layout/SuperAdminLayoutClient";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["SUPER_ADMIN"]);

  return (
    <SuperAdminLayoutClient user={session}>
      {children}
    </SuperAdminLayoutClient>
  );
}
