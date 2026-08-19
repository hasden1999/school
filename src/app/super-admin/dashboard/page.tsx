import { getSuperAdminDashboardStats } from "@/app/actions/superAdminActions";
import { SuperAdminDashboardClient } from "./SuperAdminDashboardClient";

export const revalidate = 0; // Dynamic server component

export default async function SuperAdminDashboardPage() {
  const data = await getSuperAdminDashboardStats();

  return <SuperAdminDashboardClient data={data} />;
}
