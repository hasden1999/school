import { requireAuth } from "@/lib/auth";
import { TeacherNavbar } from "@/components/layout/TeacherNavbar";
import { prisma } from "@/lib/prisma";
import { SchoolSuspendedView } from "@/components/billing/SchoolSuspendedView";
import { getPlatformContactInfoAction } from "@/app/actions/authActions";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["TEACHER", "ADMIN"]);

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
    <div className="min-h-screen flex flex-col font-cairo selection:bg-brand-100 selection:text-brand-900">
      <TeacherNavbar user={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
