import { requireAuth } from "@/lib/auth";
import { TeacherNavbar } from "@/components/layout/TeacherNavbar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["TEACHER", "ADMIN"]);

  return (
    <div className="min-h-screen flex flex-col font-cairo selection:bg-brand-100 selection:text-brand-900">
      <TeacherNavbar user={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
