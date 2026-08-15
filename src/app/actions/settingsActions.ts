"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSchoolSettingsAction() {
  const session = await requireAuth(["ADMIN"]);
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  });

  return { success: true, tenant };
}

export async function updateSchoolSettingsAction(data: {
  name: string;
  logo?: string;
  stampUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  schoolType: string;
  motto?: string;
  directorName?: string;
  currency: string;
  leaveCutoffTime: string;
  attendanceAlertTime: string;
  activeYear: string;
  printFooterText?: string;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  if (!data.name || data.name.trim().length < 3) {
    return { error: "يرجى كتابة اسم المدرسة الرسمي بشكل صحيح (3 أحرف على الأقل)." };
  }

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      name: data.name.trim(),
      logo: data.logo?.trim() || null,
      stampUrl: data.stampUrl?.trim() || null,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      schoolType: data.schoolType || "ثانوية كاملة (بنين)",
      motto: data.motto?.trim() || null,
      directorName: data.directorName?.trim() || null,
      currency: data.currency || "د.ع",
      leaveCutoffTime: data.leaveCutoffTime || "08:00",
      attendanceAlertTime: data.attendanceAlertTime || "09:00",
      activeYear: data.activeYear || "2024-2025",
      printFooterText: data.printFooterText?.trim() || "وثيقة رسمية صادرة من إدارة المدرسة — أي كشط أو تحبير يعتبر لاغياً",
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/students");
  return { success: true, tenant: updatedTenant };
}
