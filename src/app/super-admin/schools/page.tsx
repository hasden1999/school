import { getSuperAdminDashboardStats } from "@/app/actions/superAdminActions";
import { SuperAdminDashboardClient } from "../dashboard/SuperAdminDashboardClient";

export const revalidate = 0;

export default async function SuperAdminSchoolsPage() {
  const data = await getSuperAdminDashboardStats();

  return <SuperAdminDashboardClient data={data} />;
}
