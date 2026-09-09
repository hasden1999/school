import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RegisterClient } from "./RegisterClient";

export const revalidate = 0;

export default async function RegisterPage() {
  const session = await getSession();

  // If already logged in, redirect directly to dashboard
  if (session) {
    if (session.role === "SUPER_ADMIN") {
      redirect("/super-admin/dashboard");
    } else if (session.role === "TEACHER") {
      redirect("/teacher/dashboard");
    } else if (session.role === "STUDENT") {
      redirect("/student/dashboard");
    } else {
      redirect("/admin/dashboard");
    }
  }

  return <RegisterClient />;
}
