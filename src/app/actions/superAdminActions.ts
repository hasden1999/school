"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, setSession, hashPassword } from "@/lib/auth";
import { generateFiveDistinctLetters } from "@/lib/credentialGenerator";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Super Admin Permission Guard
async function checkSuperAdmin() {
  const session = await requireAuth(["SUPER_ADMIN"]);
  return session;
}

/**
 * Public action: School director submits request to join / start 14-day trial
 */
export async function submitJoinRequestAction(formData: FormData) {
  try {
    const schoolName = (formData.get("schoolName") as string)?.trim();
    const directorName = (formData.get("directorName") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const province = (formData.get("province") as string)?.trim() || "بغداد";
    const estimatedStudents = parseInt(formData.get("estimatedStudents") as string, 10) || 300;

    if (!schoolName || !directorName || !phone) {
      return { error: "يرجى ملء كافة الحقول (اسم المدرسة، اسم المدير، رقم الهاتف أو الواتساب)" };
    }

    const request = await prisma.schoolJoinRequest.create({
      data: {
        schoolName,
        directorName,
        phone,
        province,
        estimatedStudents,
        status: "PENDING",
      },
    });

    revalidatePath("/super-admin/dashboard");
    return { success: true, id: request.id };
  } catch (err: any) {
    console.error("Submit Join Request Error:", err);
    return { error: err.message || "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً" };
  }
}

/**
 * Super Admin: Get all prospective school inquiries
 */
export async function getJoinRequestsAction() {
  await checkSuperAdmin();

  return prisma.schoolJoinRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Core engine to provision a new school tenant & director account
 */
export async function provisionNewSchoolTenant({
  schoolName,
  schoolCode,
  directorName,
  directorPhone,
  province = "بغداد",
  address = "بغداد",
  currency = "د.ع",
  durationMonths = 12,
  isTrial = true,
}: {
  schoolName: string;
  schoolCode?: string;
  directorName: string;
  directorPhone: string;
  province?: string;
  address?: string;
  currency?: string;
  durationMonths?: number;
  isTrial?: boolean;
}) {
  // Clean or generate unique school code
  let cleanCode = (schoolCode || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!cleanCode || cleanCode.length < 3) {
    cleanCode = "school-" + generateFiveDistinctLetters();
  }

  const existing = await prisma.tenant.findUnique({ where: { code: cleanCode } });
  if (existing) {
    cleanCode = cleanCode + "-" + generateFiveDistinctLetters().slice(0, 3);
  }

  // Generate distinct 5-letter passcode for director
  const directorUsername = "admin";
  const directorPassword = generateFiveDistinctLetters();
  const passwordHash = await hashPassword(directorPassword);

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const subscriptionExpiresAt = isTrial
    ? trialEndsAt
    : new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000);

  const { newTenant, adminUser } = await prisma.$transaction(
    async (tx) => {
      // 1. Tenant
      const t = await tx.tenant.create({
        data: {
          name: schoolName,
          code: cleanCode,
          phone: directorPhone,
          address: `${province} - ${address}`,
          currency,
          directorName,
          activeYear: "2024-2025",
          leaveCutoffTime: "08:00",
          attendanceAlertTime: "09:00",
          subscriptionStatus: isTrial ? "TRIAL" : "ACTIVE",
          subscriptionPlan: isTrial ? "TRIAL" : "PRO",
          trialEndsAt,
          subscriptionExpiresAt,
          maxStudentsLimit: 500,
          isWhatsAppEnabled: true,
        },
      });

      // 2. Director Admin User
      const u = await tx.user.create({
        data: {
          tenantId: t.id,
          username: directorUsername,
          fullName: directorName,
          passwordHash,
          plainPasscode: directorPassword,
          phone: directorPhone,
          role: "ADMIN",
          mustChangePassword: false,
        },
      });

      // 3. Iraqi Classrooms & Sections
      const defaultClasses = [
        { name: "الأول متوسط", code: "1-INT", tuition: 1500000, orderIndex: 1 },
        { name: "الثاني متوسط", code: "2-INT", tuition: 1500000, orderIndex: 2 },
        { name: "الثالث متوسط", code: "3-INT", tuition: 1600000, orderIndex: 3 },
        { name: "الرابع الإعدادي (العلمي)", code: "4-SCI", tuition: 1800000, orderIndex: 4 },
        { name: "الخامس الإعدادي (العلمي)", code: "5-SCI", tuition: 1900000, orderIndex: 5 },
        { name: "السادس الإعدادي (العلمي)", code: "6-SCI", tuition: 2200000, orderIndex: 6 },
      ];

      for (const c of defaultClasses) {
        await tx.classRoom.create({
          data: {
            tenantId: t.id,
            name: c.name,
            code: c.code,
            annualTuition: c.tuition,
            orderIndex: c.orderIndex,
            sections: {
              create: {
                tenantId: t.id,
                name: "أ",
              },
            },
          },
        });
      }

      // 4. Standard Subjects
      await tx.subject.createMany({
        data: [
          { tenantId: t.id, name: "التربية الإسلامية", code: "ISLAMIC", orderIndex: 1 },
          { tenantId: t.id, name: "اللغة العربية", code: "ARABIC", orderIndex: 2 },
          { tenantId: t.id, name: "اللغة الإنكليزية", code: "ENG", orderIndex: 3 },
          { tenantId: t.id, name: "الرياضيات", code: "MATH", orderIndex: 4 },
          { tenantId: t.id, name: "الفيزياء", code: "PHYS", orderIndex: 5 },
          { tenantId: t.id, name: "الكيمياء", code: "CHEM", orderIndex: 6 },
          { tenantId: t.id, name: "الأحياء", code: "BIO", orderIndex: 7 },
          { tenantId: t.id, name: "الحاسوب", code: "CS", orderIndex: 8 },
        ],
      });

      // 5. Document Requirements
      await tx.documentRequirement.createMany({
        data: [
          { tenantId: t.id, title: "البطاقة الوطنية الموحدة / هوية الأحوال المدنية", isRequired: true },
          { tenantId: t.id, title: "شهادة الجنسية العراقية", isRequired: true },
          { tenantId: t.id, title: "بطاقة السكن المعتمدة", isRequired: true },
          { tenantId: t.id, title: "وثيقة التخرج / درجات الصف السابق", isRequired: true },
          { tenantId: t.id, title: "صور شخصية حديثة بخلفية بيضاء عدد 4", isRequired: true },
          { tenantId: t.id, title: "كارت التلقيحات والفحص الطبي للمدرسة", isRequired: true },
        ],
      });

      return { newTenant: t, adminUser: u };
    },
    { maxWait: 20000, timeout: 35000 }
  );

  // Format phone for WhatsApp
  const cleanPhone = directorPhone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("0")
    ? "964" + cleanPhone.slice(1)
    : cleanPhone.startsWith("964")
    ? cleanPhone
    : "964" + cleanPhone;

  const welcomeMessage = `أهلاً بك أستاذ ${directorName} المحترم،\nتم تفعيل منظومة (${schoolName}) السحابية بنجاح 🚀\n\n🔗 رابط المنظومة: https://school-saas-iraq.vercel.app/login\n🏫 كود المدرسة: ${cleanCode}\n👤 اسم المستخدم للمدير: ${directorUsername}\n🔑 رمز المرور السري: ${directorPassword}\n\nنتمنى لكم عاماً دراسياً متميزاً وموفقاً!`;
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(welcomeMessage)}`;

  return {
    tenant: newTenant,
    user: adminUser,
    directorUsername,
    directorPassword,
    schoolCode: cleanCode,
    whatsappUrl,
    welcomeMessage,
  };
}

/**
 * Super Admin: Approve an inquiry and create the school
 */
export async function approveAndProvisionSchoolAction(requestId: string, customCode?: string) {
  await checkSuperAdmin();

  const req = await prisma.schoolJoinRequest.findUnique({ where: { id: requestId } });
  if (!req) {
    return { error: "طلب الانضمام غير موجود" };
  }

  const result = await provisionNewSchoolTenant({
    schoolName: req.schoolName,
    schoolCode: customCode,
    directorName: req.directorName,
    directorPhone: req.phone,
    province: req.province,
    isTrial: true,
  });

  await prisma.schoolJoinRequest.update({
    where: { id: requestId },
    data: { status: "PROVISIONED" },
  });

  revalidatePath("/super-admin/dashboard");
  revalidatePath("/super-admin/schools");

  return { success: true, ...result };
}

/**
 * Super Admin: Create a new school manually from the modal
 */
export async function createSchoolDirectlyAction(formData: FormData) {
  await checkSuperAdmin();

  const schoolName = (formData.get("schoolName") as string)?.trim();
  const schoolCode = (formData.get("schoolCode") as string)?.trim();
  const directorName = (formData.get("directorName") as string)?.trim();
  const directorPhone = (formData.get("directorPhone") as string)?.trim();
  const province = (formData.get("province") as string)?.trim() || "بغداد";
  const plan = (formData.get("plan") as string) || "PRO";
  const durationMonths = parseInt(formData.get("durationMonths") as string, 10) || 12;
  const isTrial = formData.get("isTrial") === "true";

  if (!schoolName || !directorName || !directorPhone) {
    return { error: "يرجى ملء جميع الحقول المطلوبة" };
  }

  const result = await provisionNewSchoolTenant({
    schoolName,
    schoolCode,
    directorName,
    directorPhone,
    province,
    durationMonths,
    isTrial,
  });

  revalidatePath("/super-admin/dashboard");
  revalidatePath("/super-admin/schools");

  return { success: true, ...result };
}

export async function getSuperAdminDashboardStats() {
  await checkSuperAdmin();

  const [
    totalTenants,
    activeTenants,
    trialTenants,
    suspendedTenants,
    totalStudents,
    totalTeachers,
    payments,
    allSchools,
    joinRequests,
  ] = await Promise.all([
    prisma.tenant.count({ where: { code: { not: "super-platform" } } }),
    prisma.tenant.count({ where: { code: { not: "super-platform" }, subscriptionStatus: "ACTIVE" } }),
    prisma.tenant.count({ where: { code: { not: "super-platform" }, subscriptionStatus: "TRIAL" } }),
    prisma.tenant.count({ where: { code: { not: "super-platform" }, subscriptionStatus: "SUSPENDED" } }),
    prisma.studentProfile.count(),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.platformPayment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { tenant: true },
    }),
    prisma.tenant.findMany({
      where: { code: { not: "super-platform" } },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            studentProfiles: true,
            users: true,
            classRooms: true,
          },
        },
        platformPayments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.schoolJoinRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return {
    totalTenants,
    activeTenants,
    trialTenants,
    suspendedTenants,
    totalStudents,
    totalTeachers,
    totalRevenue,
    recentPayments: payments,
    allSchools,
    joinRequests,
  };
}

export async function getAllSchoolsAction(filters?: { search?: string; status?: string }) {
  await checkSuperAdmin();

  return prisma.tenant.findMany({
    where: {
      code: { not: "super-platform" },
      ...(filters?.status && filters.status !== "ALL" && { subscriptionStatus: filters.status }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { code: { contains: filters.search, mode: "insensitive" } },
          { directorName: { contains: filters.search, mode: "insensitive" } },
          { phone: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          studentProfiles: true,
          users: true,
          classRooms: true,
        },
      },
      platformPayments: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });
}

export async function updateSchoolSubscriptionAction(formData: FormData) {
  const superAdmin = await checkSuperAdmin();

  const tenantId = formData.get("tenantId") as string;
  const durationMonths = parseInt(formData.get("durationMonths") as string, 10) || 1;
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const paymentMethod = (formData.get("paymentMethod") as string) || "ZAIN_CASH";
  const referenceNumber = (formData.get("referenceNumber") as string) || "";
  const notes = (formData.get("notes") as string) || "تجديد اشتراك يدوي من لوحة مالك المنظومة";
  const plan = (formData.get("plan") as string) || "PRO";

  if (!tenantId) {
    return { error: "معرف المدرسة غير صالح" };
  }

  const school = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!school) {
    return { error: "المدرسة غير موجودة" };
  }

  // Calculate new expiration date
  const baseDate = school.subscriptionExpiresAt && school.subscriptionExpiresAt > new Date()
    ? new Date(school.subscriptionExpiresAt)
    : new Date();

  baseDate.setMonth(baseDate.getMonth() + durationMonths);

  await prisma.$transaction([
    prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: plan,
        subscriptionExpiresAt: baseDate,
      },
    }),
    prisma.platformPayment.create({
      data: {
        tenantId,
        amount,
        currency: "USD",
        paymentMethod,
        referenceNumber,
        durationMonths,
        notes,
        status: "APPROVED",
        recordedBy: superAdmin.username,
      },
    }),
  ]);

  revalidatePath("/super-admin/dashboard");
  revalidatePath("/super-admin/schools");
  revalidatePath("/super-admin/billing");

  return { success: true, newExpiry: baseDate.toISOString() };
}

export async function toggleSchoolSuspensionAction(tenantId: string, suspend: boolean) {
  await checkSuperAdmin();

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      subscriptionStatus: suspend ? "SUSPENDED" : "ACTIVE",
    },
  });

  revalidatePath("/super-admin/dashboard");
  revalidatePath("/super-admin/schools");

  return { success: true, status: suspend ? "SUSPENDED" : "ACTIVE" };
}

export async function impersonateSchoolAdminAction(tenantId: string) {
  await checkSuperAdmin();

  const school = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      users: {
        where: { role: "ADMIN", active: true },
        take: 1,
      },
    },
  });

  if (!school || !school.users[0]) {
    return { error: "لا يوجد حساب مدير مفعل لهذه المدرسة للدخول إليه" };
  }

  const adminUser = school.users[0];

  // Set session as school admin
  await setSession({
    id: adminUser.id,
    tenantId: school.id,
    username: adminUser.username,
    fullName: `${adminUser.fullName} (دعم المالك الفني)`,
    role: "ADMIN",
    phone: adminUser.phone,
    mustChangePassword: false,
    schoolName: school.name,
  });

  redirect("/admin/dashboard");
}

export async function createSystemBroadcastAction(formData: FormData) {
  await checkSuperAdmin();

  const title = (formData.get("title") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const priority = (formData.get("priority") as string) || "INFO";

  if (!title || !message) {
    return { error: "يرجى كتابة عنوان ونص الإشعار العام" };
  }

  await prisma.systemBroadcast.create({
    data: {
      title,
      message,
      priority,
      active: true,
    },
  });

  // Create notifications for all school directors
  const allAdmins = await prisma.user.findMany({
    where: { role: "ADMIN", active: true, tenant: { code: { not: "super-platform" } } },
  });

  if (allAdmins.length > 0) {
    await prisma.notification.createMany({
      data: allAdmins.map((admin) => ({
        tenantId: admin.tenantId,
        userId: admin.id,
        title: `📢 إعلان عام: ${title}`,
        message,
        type: "SYSTEM",
        link: "/admin/dashboard",
        isRead: false,
      })),
    });
  }

  revalidatePath("/super-admin/dashboard");
  revalidatePath("/super-admin/broadcast");

  return { success: true };
}
