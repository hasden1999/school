import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginClient } from "./LoginClient";

export const revalidate = 0;

export default async function LoginPage() {
  const session = await getSession();

  // If already logged in, redirect directly to dashboard without showing login form
  if (session) {
    if (session.role === "SUPER_ADMIN") {
      redirect("/super-admin/dashboard");
    } else if (session.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else if (session.role === "TEACHER") {
      redirect("/teacher/dashboard");
    } else if (session.role === "STUDENT") {
      redirect("/student/dashboard");
    }
  }

  return <LoginClient />;
}
