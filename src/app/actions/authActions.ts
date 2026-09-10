"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession, verifyPassword, hashPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

// Helper to normalize Eastern Arabic digits (٠-٩) to English digits (0-9)
function normalizeEasternArabicDigits(str: string): string {
  if (!str) return str;
  const easternDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str.replace(/[٠-٩]/g, (w) => easternDigits.indexOf(w).toString());
}

// Ensure Super Admin Master account exists securely
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

    const initialPassword =
      process.env.SUPER_ADMIN_INITIAL_PASSWORD ||
      process.env.SUPER_ADMIN_PASSWORD ||
      "super123";
    const passwordHash = await hashPassword(initialPassword);
    await prisma.user.create({
      data: {
        tenantId: masterTenant.id,
        username: "superadmin",
        passwordHash,
        plainPasscode: initialPassword,
        fullName: "مالك المنظومة الرئيسي (Super Admin)",
        phone: "07800000000",
        role: "SUPER_ADMIN",
        mustChangePassword: false,
      },
    });
  }
}

// Public action to lookup school branding & metadata by code
export async function getSchoolBrandingAction(rawCode: string) {
  try {
    const schoolCode = normalizeEasternArabicDigits(rawCode || "").trim().toLowerCase();
    if (!schoolCode) return { success: false, error: "يرجى إدخال رمز المدرسة" };

    const tenant = await prisma.tenant.findUnique({
      where: { code: schoolCode },
      select: {
        id: true,
        name: true,
        code: true,
        logo: true,
        motto: true,
        schoolType: true,
        subscriptionStatus: true,
      },
    });

    if (!tenant) {
      return { success: false, error: "رمز المدرسة المدخل غير مسجل في المنظومة" };
    }

    return {
      success: true,
      school: tenant,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "فشل التحقق من رمز المدرسة" };
  }
}

export async function loginAction(formData: FormData) {
  const rawUsername = (formData.get("username") as string)?.trim().toLowerCase();
  const rawPassword = (formData.get("password") as string)?.trim();
  const rawSchoolCode = (formData.get("schoolCode") as string)?.trim().toLowerCase();

  const username = normalizeEasternArabicDigits(rawUsername || "");
  const password = normalizeEasternArabicDigits(rawPassword || "");
  const schoolCode = normalizeEasternArabicDigits(rawSchoolCode || "");

  if (!username || !password) {
    return { error: "يرجى إدخال اسم المستخدم وكلمة المرور" };
  }

  let user: any = null;

  // Helper to verify credentials against bcrypt hash or plainPasscode fallback
  const checkUserPassword = async (candidate: any, pass: string): Promise<boolean> => {
    try {
      if (candidate.passwordHash && (await verifyPassword(pass, candidate.passwordHash))) {
        return true;
      }
    } catch {}
    if (
      candidate.plainPasscode &&
      candidate.plainPasscode.trim().toLowerCase() === pass.toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  if (username === "superadmin") {
    await ensureSuperAdminExists();
    user = await prisma.user.findFirst({
      where: {
        role: "SUPER_ADMIN",
        active: true,
      },
      include: { tenant: true },
    });
    if (!user || !(await checkUserPassword(user, password))) {
      return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }
  } else if (schoolCode) {
    const trimmedCode = schoolCode.trim().toLowerCase();
    const tenant = await prisma.tenant.findUnique({
      where: { code: trimmedCode },
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

    if (!user || !(await checkUserPassword(user, password))) {
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
      const isValid = await checkUserPassword(candidate, password);
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
  if (user.role !== "SUPER_ADMIN") {
    const now = new Date();
    const isTrialExpired =
      user.tenant?.subscriptionStatus === "TRIAL" &&
      user.tenant?.trialEndsAt &&
      new Date(user.tenant.trialEndsAt) < now;
    const isSubscriptionExpired =
      user.tenant?.subscriptionExpiresAt &&
      new Date(user.tenant.subscriptionExpiresAt) < now;

    if (user.tenant?.subscriptionStatus === "SUSPENDED" || isTrialExpired || isSubscriptionExpired) {
      return {
        error: isTrialExpired
          ? "انتهت فترة التجربة المجانية المحددة بـ 14 يوماً لمدرستكم. يرجى التواصل مع إدارة المنظومة لتفعيل النسخة الرسمية."
          : "عذراً، اشتراك هذه المدرسة في المنظومة معلق حالياً. يرجى التواصل مع إدارة المنظومة لتجديد التفعيل.",
        isExpired: true,
        schoolCode: user.tenant?.code,
        redirectUrl: `/subscription-expired?code=${encodeURIComponent(user.tenant?.code || "")}`,
      };
    }
  }

  await setSession({
    id: user.id,
    tenantId: user.tenantId,
    username: user.username,
    fullName: user.fullName,
    role: user.role as any,
    jobTitle: user.jobTitle || null,
    permissionsJson: user.permissionsJson || null,
    isCustomPermissions: !!user.isCustomPermissions,
    phone: user.phone,
    mustChangePassword: user.mustChangePassword,
    schoolName: user.tenant?.name || "منظومة المدارس",
  });

  // Role based redirection URL
  let redirectUrl = "/student/dashboard";
  if (user.role === "SUPER_ADMIN") {
    redirectUrl = "/super-admin/dashboard";
  } else if (
    user.role === "ADMIN" ||
    user.role === "VICE_PRINCIPAL" ||
    user.role === "ACCOUNTANT" ||
    user.role === "STAFF" ||
    user.role === "SUPERVISOR" ||
    user.role === "CUSTOM"
  ) {
    redirectUrl = "/admin/dashboard";
  } else if (user.role === "TEACHER") {
    redirectUrl = "/teacher/dashboard";
  }

  return { success: true, redirectUrl };
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

    // Set Session & Return success
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

    return { success: true, redirectUrl: "/admin/dashboard", schoolCode: tenant.code };
  } catch (err: any) {
    console.error("Register School Error:", err);
    return { error: err.message || "حدث خطأ أثناء إنشاء بيئة المدرسة، يرجى المحاولة مرة أخرى" };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

/**
 * Get Platform Owner Contact Info (WhatsApp, Phone)
 */
export async function getPlatformContactInfoAction() {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
      select: { phone: true, fullName: true },
    });

    const phone =
      process.env.NEXT_PUBLIC_PLATFORM_PHONE ||
      superAdmin?.phone ||
      "07800000000";
    const whatsapp =
      process.env.NEXT_PUBLIC_PLATFORM_WHATSAPP ||
      phone;

    return {
      phone,
      whatsapp,
      fullName: superAdmin?.fullName || "مالك وإدارة المنظومة المركزية",
    };
  } catch {
    return {
      phone: "07800000000",
      whatsapp: "9647800000000",
      fullName: "إدارة المنظومة المركزية",
    };
  }
}

/**
 * Get Expired School Details for the public/locked-out screen
 */
export async function getSchoolExpiredDetailsAction(code: string) {
  try {
    const cleanCode = (code || "").trim().toLowerCase();
    if (!cleanCode) return null;

    const tenant = await prisma.tenant.findUnique({
      where: { code: cleanCode },
      select: {
        id: true,
        name: true,
        code: true,
        directorName: true,
        phone: true,
        address: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        trialEndsAt: true,
        subscriptionExpiresAt: true,
        createdAt: true,
      },
    });

    if (!tenant) return null;

    const contact = await getPlatformContactInfoAction();

    return {
      school: tenant,
      contact,
    };
  } catch {
    return null;
  }
}

/**
 * Submit Activation Request from Locked-out School Director
 */
export async function submitActivationInquiryAction(formData: FormData) {
  try {
    const schoolCode = (formData.get("schoolCode") as string)?.trim().toLowerCase();
    const directorName = (formData.get("directorName") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const paymentMethod = (formData.get("paymentMethod") as string) || "ZAIN_CASH";
    const referenceNumber = (formData.get("referenceNumber") as string)?.trim() || "";
    const notes = (formData.get("notes") as string)?.trim() || "طلب تفعيل النسخة بعد انتهاء التجربة";

    if (!schoolCode) {
      return { error: "رمز المدرسة غير محدد" };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { code: schoolCode },
    });

    if (!tenant) {
      return { error: "المدرسة غير موجودة" };
    }

    // Register a pending platform payment record
    await prisma.platformPayment.create({
      data: {
        tenantId: tenant.id,
        amount: 0,
        currency: "USD",
        paymentMethod,
        referenceNumber,
        notes: `[طلب تفعيل إلكتروني من شاشة القفل] المدير: ${directorName || tenant.directorName} | الهاتف: ${phone || tenant.phone} | التفاصيل: ${notes}`,
        status: "PENDING",
      },
    });

    // Notify all super admins
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
    });

    for (const su of superAdmins) {
      await prisma.notification.create({
        data: {
          tenantId: su.tenantId,
          userId: su.id,
          title: `🔔 طلب تفعيل نسخة: ${tenant.name}`,
          message: `أرسلت مدرسة (${tenant.name}) طلب تفعيل للنسخة بعد انتهاء فترة التجربة. هاتف المدير: ${phone || tenant.phone || "غير محدد"}`,
          type: "SYSTEM",
          link: "/super-admin/billing",
        },
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Submit Activation Inquiry Error:", err);
    return { error: err.message || "فشل إرسال طلب التفعيل، يرجى التواصل مباشرة عبر الواتساب" };
  }
}

