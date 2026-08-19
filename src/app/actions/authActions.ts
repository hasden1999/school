"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession, verifyPassword, hashPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

// Ensure Super Admin Master account exists
export async function ensureSuperAdminExists() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (!superAdmin) {
    // Find or create Platform Master Tenant
    let masterTenant = await prisma.tenant.findUnique({
      where: { code: "super-platform" },
    });

    if (!masterTenant) {
      masterTenant = await prisma.tenant.create({
        data: {
          name: "إدارة المنظومة المركزية (Super Admin)",
          code: "super-platform",
          schoolType: "منظومة مركزية",
          directorName: "مالك المنظومة",
          currency: "USD",
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: "CUSTOM",
        },
      });
    }

    const passwordHash = await hashPassword("superadmin2024");
    await prisma.user.create({
      data: {
        tenantId: masterTenant.id,
        username: "superadmin",
        passwordHash,
        plainPasscode: "super",
        fullName: "مالك المنظومة الرئيسي (Super Admin)",
        phone: "07800000000",
        role: "SUPER_ADMIN",
        mustChangePassword: false,
      },
    });
  }
}

export async function loginAction(formData: FormData) {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();
  const schoolCode = (formData.get("schoolCode") as string)?.trim().toLowerCase();

  if (!username || !password) {
    return { error: "يرجى إدخال اسم المستخدم وكلمة المرور" };
  }

  if (username === "superadmin") {
    await ensureSuperAdminExists();
  }

  let user: any = null;

  if (schoolCode) {
    const tenant = await prisma.tenant.findUnique({
      where: { code: schoolCode },
    });
    if (!tenant) {
      return { error: "رمز المدرسة المدخل غير مسجل في المنظومة" };
    }
    user = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        username,
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
  } else {
    // Look up across all tenants and match password against matching accounts!
    const candidates = await prisma.user.findMany({
      where: {
        username,
        active: true,
      },
      include: { tenant: true },
    });

    if (!candidates || candidates.length === 0) {
      return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }

    for (const candidate of candidates) {
      const isValid = await verifyPassword(password, candidate.passwordHash);
      if (isValid) {
        user = candidate;
        break;
      }
    }

    if (!user) {
      return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }
  }

  // Check school subscription status (unless user is Super Admin)
  if (user.role !== "SUPER_ADMIN" && user.tenant?.subscriptionStatus === "SUSPENDED") {
    return {
      error: "عذراً، اشتراك هذه المدرسة في المنظومة معلق حالياً لانتهاء فترة الصلاحية. يرجى التواصل مع إدارة المنظومة لتجديد التفعيل.",
    };
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
  if (user.role === "SUPER_ADMIN") {
    redirect("/super-admin/dashboard");
  } else if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "TEACHER") {
    redirect("/teacher/dashboard");
  } else {
    redirect("/student/dashboard");
  }
}

export async function registerSchoolAction(formData: FormData) {
  try {
    const schoolName = (formData.get("schoolName") as string)?.trim();
    let schoolCode = (formData.get("schoolCode") as string)?.trim().toLowerCase();
    const directorName = (formData.get("directorName") as string)?.trim();
    const directorPhone = (formData.get("directorPhone") as string)?.trim();
    const username = ((formData.get("username") as string)?.trim() || "admin").toLowerCase();
    const password = (formData.get("password") as string)?.trim();
    const province = (formData.get("province") as string)?.trim() || "بغداد";
    const address = (formData.get("address") as string)?.trim() || province;
    const currency = (formData.get("currency") as string)?.trim() || "د.ع";

    if (!schoolName || !directorName || !password) {
      return { error: "يرجى ملء جميع الحقول الإلزامية (اسم المدرسة، اسم المدير، كلمة المرور)" };
    }

    // Clean or generate school code
    if (!schoolCode) {
      schoolCode = "school-" + Math.floor(1000 + Math.random() * 9000);
    } else {
      schoolCode = schoolCode.replace(/[^a-z0-9-]/g, "");
      if (schoolCode.length < 3) {
        schoolCode = schoolCode + "-" + Math.floor(100 + Math.random() * 900);
      }
    }

    // Check if school code is already taken
    const existingTenant = await prisma.tenant.findUnique({
      where: { code: schoolCode },
    });
    if (existingTenant) {
      return { error: "رمز المدرسة بالإنجليزية مستخدم بالفعل، يرجى اختيار رمز آخر" };
    }

    const passwordHash = await hashPassword(password);
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14-Day Free Trial

    // Create School & Initialize standard Iraqi curriculum in a fast transaction
    const { user, tenant } = await prisma.$transaction(
      async (tx) => {
        // 1. Create Tenant with 14-Day Free Trial
        const newTenant = await tx.tenant.create({
          data: {
            name: schoolName,
            code: schoolCode,
            phone: directorPhone,
            address: `${province} - ${address}`,
            currency,
            directorName,
            activeYear: "2024-2025",
            leaveCutoffTime: "08:00",
            attendanceAlertTime: "09:00",
            subscriptionStatus: "TRIAL",
            subscriptionPlan: "TRIAL",
            trialEndsAt: trialEndsAt,
            subscriptionExpiresAt: trialEndsAt,
            maxStudentsLimit: 500,
            isWhatsAppEnabled: true,
          },
        });

        // 2. Create Director Admin User
        const adminUser = await tx.user.create({
          data: {
            tenantId: newTenant.id,
            username,
            fullName: directorName,
            passwordHash,
            plainPasscode: password,
            phone: directorPhone,
            role: "ADMIN",
            mustChangePassword: false,
          },
        });

        // 3. Initialize Standard Iraqi Classrooms & Sections with nested create
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
              tenantId: newTenant.id,
              name: c.name,
              code: c.code,
              annualTuition: c.tuition,
              orderIndex: c.orderIndex,
              sections: {
                create: {
                  tenantId: newTenant.id,
                  name: "أ",
                },
              },
            },
          });
        }

        // 4. Initialize Standard Iraqi Subjects in 1 single fast query
        await tx.subject.createMany({
          data: [
            { tenantId: newTenant.id, name: "التربية الإسلامية", code: "ISLAMIC", orderIndex: 1 },
            { tenantId: newTenant.id, name: "اللغة العربية", code: "ARABIC", orderIndex: 2 },
            { tenantId: newTenant.id, name: "اللغة الإنكليزية", code: "ENG", orderIndex: 3 },
            { tenantId: newTenant.id, name: "الرياضيات", code: "MATH", orderIndex: 4 },
            { tenantId: newTenant.id, name: "الفيزياء", code: "PHYS", orderIndex: 5 },
            { tenantId: newTenant.id, name: "الكيمياء", code: "CHEM", orderIndex: 6 },
            { tenantId: newTenant.id, name: "الأحياء", code: "BIO", orderIndex: 7 },
            { tenantId: newTenant.id, name: "الحاسوب", code: "CS", orderIndex: 8 },
          ],
        });

        // 5. Initialize Standard Iraqi Student Document Requirements in 1 single fast query
        await tx.documentRequirement.createMany({
          data: [
            { tenantId: newTenant.id, title: "البطاقة الوطنية الموحدة / هوية الأحوال المدنية", isRequired: true },
            { tenantId: newTenant.id, title: "شهادة الجنسية العراقية", isRequired: true },
            { tenantId: newTenant.id, title: "بطاقة السكن المعتمدة", isRequired: true },
            { tenantId: newTenant.id, title: "وثيقة التخرج / درجات الصف السابق", isRequired: true },
            { tenantId: newTenant.id, title: "صور شخصية حديثة بخلفية بيضاء عدد 4", isRequired: true },
            { tenantId: newTenant.id, title: "كارت التلقيحات والفحص الطبي للمدرسة", isRequired: true },
          ],
        });

        return { user: adminUser, tenant: newTenant };
      },
      { maxWait: 20000, timeout: 35000 }
    );

    // Set Session & Redirect to Admin Dashboard
    await setSession({
      id: user.id,
      tenantId: tenant.id,
      username: user.username,
      fullName: user.fullName,
      role: "ADMIN",
      phone: user.phone,
      mustChangePassword: false,
      schoolName: tenant.name,
    });
  } catch (err: any) {
    console.error("Register School Error:", err);
    return { error: err.message || "حدث خطأ أثناء إنشاء بيئة المدرسة، يرجى المحاولة مرة أخرى" };
  }

  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
