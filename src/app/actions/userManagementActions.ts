"use server";

import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  SystemPermission,
  ALL_SYSTEM_PERMISSIONS,
  SYSTEM_ROLE_PRESETS,
} from "@/lib/permissions";

export async function getAllUsersWithPermissionsAction(tenantIdFilter?: string) {
  const session = await getSession();
  if (!session) throw new Error("غير مصرح لك بالوصول");

  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const targetTenantId = isSuperAdmin && tenantIdFilter ? tenantIdFilter : session.tenantId;

  const whereClause: any = {};
  if (!isSuperAdmin) {
    whereClause.tenantId = session.tenantId;
  } else if (tenantIdFilter) {
    whereClause.tenantId = tenantIdFilter;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  const tenants = isSuperAdmin
    ? await prisma.tenant.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      })
    : [];

  return { users, tenants };
}

export async function createUserWithPermissionsAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "غير مصرح لك بالوصول" };

  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const tenantId = isSuperAdmin
    ? (formData.get("tenantId") as string) || session.tenantId
    : session.tenantId;

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();
  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const role = (formData.get("role") as string) || "STAFF";
  const jobTitle = (formData.get("jobTitle") as string)?.trim();
  const monthlySalary = parseFloat((formData.get("monthlySalary") as string) || "0");
  const permissionsRaw = formData.get("permissions") as string;

  if (!username || !password || !fullName) {
    return { error: "يرجى تعبئة الحقول الأساسية المطلوبة" };
  }

  // Check if username already exists in this tenant
  const existing = await prisma.user.findFirst({
    where: { tenantId, username },
  });

  if (existing) {
    return { error: "اسم المستخدم هذا مسجل مسبقاً في هذه المدرسة" };
  }

  let permissionsJson: string | null = null;
  let isCustomPermissions = false;

  if (permissionsRaw) {
    try {
      const parsed = JSON.parse(permissionsRaw);
      if (Array.isArray(parsed)) {
        permissionsJson = JSON.stringify(parsed);
        isCustomPermissions = true;
      }
    } catch {
      // fallback
    }
  }

  // If no custom permissions provided, check if role preset applies
  if (!permissionsJson && SYSTEM_ROLE_PRESETS[role]) {
    permissionsJson = JSON.stringify(SYSTEM_ROLE_PRESETS[role].defaultPermissions);
  }

  const passwordHash = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      tenantId,
      username,
      passwordHash,
      plainPasscode: password,
      fullName,
      phone: phone || null,
      role,
      jobTitle: jobTitle || null,
      permissionsJson,
      isCustomPermissions,
      monthlySalary,
      mustChangePassword: false,
      active: true,
    },
  });

  revalidatePath("/super-admin/roles");
  revalidatePath("/super-admin/users");
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/settings");

  return { success: true, user: newUser };
}

export async function updateUserPermissionsAction(
  userId: string,
  payload: {
    role: string;
    jobTitle?: string;
    fullName?: string;
    phone?: string;
    active?: boolean;
    monthlySalary?: number;
    permissions: SystemPermission[];
  }
) {
  const session = await getSession();
  if (!session) return { error: "غير مصرح لك بالوصول" };

  const isSuperAdmin = session.role === "SUPER_ADMIN";

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return { error: "المستخدم غير موجود في النظام" };
  }

  // Authorization check: Only Super Admin can modify the School Director (ADMIN) or other high-level staff
  if (!isSuperAdmin) {
    if (targetUser.tenantId !== session.tenantId) {
      return { error: "لا تملك صلاحية تعديل مستخدمين خارج مدرستك" };
    }
    if (targetUser.role === "ADMIN" && session.id !== targetUser.id) {
      return { error: "فقط المشرف العام (Super Admin) يملك صلاحية تعديل وتخصيص صلاحيات مدير المدرسة" };
    }
    if (targetUser.role === "SUPER_ADMIN") {
      return { error: "لا يمكن تعديل حساب المشرف العام" };
    }
  }

  const permissionsJson = JSON.stringify(payload.permissions);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      role: payload.role,
      jobTitle: payload.jobTitle || null,
      fullName: payload.fullName || targetUser.fullName,
      phone: payload.phone !== undefined ? payload.phone : targetUser.phone,
      active: payload.active !== undefined ? payload.active : targetUser.active,
      monthlySalary: payload.monthlySalary !== undefined ? payload.monthlySalary : targetUser.monthlySalary,
      permissionsJson,
      isCustomPermissions: true,
    },
  });

  revalidatePath("/super-admin/roles");
  revalidatePath("/super-admin/users");
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/settings");

  return { success: true, user: updated };
}

export async function resetUserPasswordAction(userId: string, newPasscode: string) {
  const session = await getSession();
  if (!session) return { error: "غير مصرح لك بالوصول" };

  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!targetUser) return { error: "المستخدم غير موجود" };

  if (!isSuperAdmin && targetUser.tenantId !== session.tenantId) {
    return { error: "غير مصرح لك بتغيير كلمة المرور لهذا المستخدم" };
  }

  const passwordHash = await hashPassword(newPasscode);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      plainPasscode: newPasscode,
    },
  });

  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const session = await getSession();
  if (!session) return { error: "غير مصرح لك بالوصول" };

  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!targetUser) return { error: "المستخدم غير موجود" };

  if (targetUser.role === "SUPER_ADMIN") {
    return { error: "لا يمكن حذف حساب المشرف العام للنظام" };
  }

  if (!isSuperAdmin && targetUser.tenantId !== session.tenantId) {
    return { error: "غير مصرح لك بحذف هذا المستخدم" };
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/super-admin/roles");
  revalidatePath("/super-admin/users");
  revalidatePath("/admin/teachers");

  return { success: true };
}
