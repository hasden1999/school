import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PermissionsClient } from "./PermissionsClient";
import {
  getClassPermissionsPoliciesAction,
  getStudentOverridesAction,
} from "@/app/actions/permissionsPolicyActions";

export const revalidate = 0;

export default async function PermissionsPage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  // 1. Fetch staff & teacher users
  const users = await prisma.user.findMany({
    where: { tenantId },
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
  });

  // 2. Fetch classes with policies
  const { classRooms } = await getClassPermissionsPoliciesAction();

  // 3. Fetch student overrides
  const { students } = await getStudentOverridesAction();

  return (
    <PermissionsClient
      users={users}
      classRooms={classRooms}
      students={students}
      currentUser={session}
    />
  );
}
