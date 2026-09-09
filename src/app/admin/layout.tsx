import { requireAuth } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import { prisma } from "@/lib/prisma";
import { SchoolSuspendedView } from "@/components/billing/SchoolSuspendedView";
import { getPlatformContactInfoAction } from "@/app/actions/authActions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["ADMIN"]);
  const school = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  });

  // Check subscription suspension and expiration
  if (school && session.role !== "SUPER_ADMIN") {
    const now = new Date();
    const isTrialExpired =
      school.subscriptionStatus === "TRIAL" &&
      school.trialEndsAt &&
      new Date(school.trialEndsAt) < now;
    const isSubscriptionExpired =
      school.subscriptionExpiresAt &&
      new Date(school.subscriptionExpiresAt) < now;

    if (school.subscriptionStatus === "SUSPENDED" || isTrialExpired || isSubscriptionExpired) {
      const contactInfo = await getPlatformContactInfoAction();
      return <SchoolSuspendedView school={school} contactInfo={contactInfo} />;
    }
  }

  return (
    <AdminLayoutClient user={session} schoolName={school?.name} tenant={school}>
      {children}
    </AdminLayoutClient>
  );
}
