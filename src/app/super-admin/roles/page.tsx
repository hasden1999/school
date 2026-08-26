import { requireAuth } from "@/lib/auth";
import { getAllUsersWithPermissionsAction } from "@/app/actions/userManagementActions";
import { SuperAdminRolesClient } from "./SuperAdminRolesClient";

export const revalidate = 0;

export default async function SuperAdminRolesPage() {
  await requireAuth(["SUPER_ADMIN"]);
  const { users, tenants } = await getAllUsersWithPermissionsAction();

  return <SuperAdminRolesClient initialUsers={users} tenants={tenants} />;
}
