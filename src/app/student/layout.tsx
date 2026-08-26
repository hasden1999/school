import { requireAuth } from "@/lib/auth";
import { StudentNavbar } from "@/components/layout/StudentNavbar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["STUDENT", "ADMIN"]);

  return (
    <div className="min-h-screen flex flex-col font-cairo selection:bg-brand-700 selection:text-white">
      <StudentNavbar user={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
