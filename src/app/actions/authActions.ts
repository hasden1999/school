"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession, verifyPassword, hashPassword, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "يرجى إدخال اسم المستخدم وكلمة المرور" };
  }

  const user = await prisma.user.findFirst({
    where: {
      username: username.trim(),
      active: true,
    },
    include: { tenant: true },
  });

  if (!user) {
    return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
  }

  await setSession({
    id: user.id,
    tenantId: user.tenantId,
    username: user.username,
    fullName: user.fullName,
    role: user.role as any,
    phone: user.phone,
    mustChangePassword: user.mustChangePassword,
    schoolName: user.tenant.name,
  });

  // Role based redirection
  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "TEACHER") {
    redirect("/teacher/dashboard");
  } else {
    redirect("/student/dashboard");
  }
}

export async function quickDemoLogin(targetRole: "ADMIN" | "TEACHER_MATH" | "TEACHER_ARABIC" | "STUDENT") {
  let targetUsername = "admin";
  if (targetRole === "TEACHER_MATH") targetUsername = "t.ahmed";
  if (targetRole === "TEACHER_ARABIC") targetUsername = "t.ali";
  if (targetRole === "STUDENT") targetUsername = "s.karrar";

  const user = await prisma.user.findFirst({
    where: { username: targetUsername },
    include: { tenant: true },
  });

  if (!user) {
    return { error: "المستخدم التجريبي غير موجود" };
  }

  await setSession({
    id: user.id,
    tenantId: user.tenantId,
    username: user.username,
    fullName: user.fullName,
    role: user.role as any,
    phone: user.phone,
    mustChangePassword: user.mustChangePassword,
    schoolName: user.tenant.name,
  });

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "TEACHER") {
    redirect("/teacher/dashboard");
  } else {
    redirect("/student/dashboard");
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
