export type SystemPermission =
  | "MANAGE_STUDENTS"
  | "MANAGE_ATTENDANCE"
  | "MANAGE_GRADES"
  | "MANAGE_REPORTS"
  | "MANAGE_SCHEDULE"
  | "MANAGE_TEACHERS"
  | "MANAGE_PAYMENTS"
  | "MANAGE_EVALUATION"
  | "MANAGE_WHATSAPP"
  | "MANAGE_BACKUP"
  | "MANAGE_SETTINGS"
  | "MANAGE_STAFF_PERMISSIONS";

export interface PermissionDefinition {
  id: SystemPermission;
  label: string;
  category: "أكاديمي" | "إداري" | "مالي" | "نظام";
  description: string;
  iconName: string;
}

export const ALL_SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  {
    id: "MANAGE_STUDENTS",
    label: "إدارة الطلاب والقبول والوثائق",
    category: "إداري",
    description: "إضافة وتعديل بيانات الطلاب، قبول الجدد، استلام الوثائق وبراءة الذمة.",
    iconName: "GraduationCap",
  },
  {
    id: "MANAGE_ATTENDANCE",
    label: "رصد الحضور والغياب والإجازات",
    category: "إداري",
    description: "متابعة الحضور الصباحي، صمام أمان الإدارة، والموافقة على طلبات الإجازة.",
    iconName: "UserCheck",
  },
  {
    id: "MANAGE_GRADES",
    label: "رصد واعتماد وأقفال الدرجات",
    category: "أكاديمي",
    description: "إدخال وتعديل وتدقيق وأقفال درجات الامتحانات الشهرية ونصف السنة والسعي السنوي.",
    iconName: "Award",
  },
  {
    id: "MANAGE_REPORTS",
    label: "مراجعة واعتماد التقارير اليومية",
    category: "أكاديمي",
    description: "تدقيق واعتماد تقارير المعلمين والواجبات المنزلية قبل نشرها لأولياء الأمور.",
    iconName: "FileSpreadsheet",
  },
  {
    id: "MANAGE_SCHEDULE",
    label: "إعداد وتعديل الجداول والحصص",
    category: "أكاديمي",
    description: "بناء الجدول الأسبوعي، تعيين الكوادر للحصص، وتحديد المعلم البديل الذكي.",
    iconName: "CalendarDays",
  },
  {
    id: "MANAGE_TEACHERS",
    label: "إدارة الهيئة التعليمية والرواتب",
    category: "إداري",
    description: "تسجيل المعلمين، ربط المواد، تحديد الرواتب الشهرية، وتكليفات الفصول.",
    iconName: "Users",
  },
  {
    id: "MANAGE_PAYMENTS",
    label: "الأقساط والوصولات المالية",
    category: "مالي",
    description: "إصدار وصولات القبض برقم تسلسلي، تتبع المتبقي، وإدارة الأقساط والخصومات.",
    iconName: "CreditCard",
  },
  {
    id: "MANAGE_EVALUATION",
    label: "استبيانات وتقييم أداء الكوادر",
    category: "أكاديمي",
    description: "إنشاء نماذج تقييم المعلمين السرية وفحص نتائج تصويت الطلاب والمدير.",
    iconName: "Sparkles",
  },
  {
    id: "MANAGE_WHATSAPP",
    label: "مركز أتمتة إشعارات الواتساب",
    category: "نظام",
    description: "إدارة طابور الرسائل التلقائية لـ 8 أحداث مدرسية وإرسال الإشعارات الجماعية.",
    iconName: "MessageSquare",
  },
  {
    id: "MANAGE_BACKUP",
    label: "النسخ الاحتياطي والأعوام الدراسية",
    category: "نظام",
    description: "تحميل النسخ الاحتياطية (JSON + PDF طوارئ) وترقية الطلاب وإغلاق الأعوام.",
    iconName: "Building2",
  },
  {
    id: "MANAGE_SETTINGS",
    label: "إعدادات وهوية المدرسة والصفوف",
    category: "نظام",
    description: "تعديل اسم المدرسة، الشعار، الختم، أوقات الصمام الصباحي، وإضافة الصفوف والمواد.",
    iconName: "Settings",
  },
  {
    id: "MANAGE_STAFF_PERMISSIONS",
    label: "إدارة وتعديل صلاحيات المستخدمين",
    category: "نظام",
    description: "تعديل صلاحيات وأدوار الموظفين والكوادر في المدرسة (بإشراف المشرف العام).",
    iconName: "ShieldCheck",
  },
];

export const SYSTEM_ROLE_PRESETS: Record<
  string,
  {
    label: string;
    description: string;
    badge: string;
    color: string;
    defaultPermissions: SystemPermission[];
  }
> = {
  SUPER_ADMIN: {
    label: "المشرف العام (مالك المنصة)",
    description: "صلاحيات سيادية كاملة 100% على كافة المدارس والمستخدمين والسيرفر وقاعدة البيانات.",
    badge: "Super Admin Master 👑",
    color: "from-amber-600 to-yellow-500",
    defaultPermissions: [
      "MANAGE_STUDENTS",
      "MANAGE_ATTENDANCE",
      "MANAGE_GRADES",
      "MANAGE_REPORTS",
      "MANAGE_SCHEDULE",
      "MANAGE_TEACHERS",
      "MANAGE_PAYMENTS",
      "MANAGE_EVALUATION",
      "MANAGE_WHATSAPP",
      "MANAGE_BACKUP",
      "MANAGE_SETTINGS",
      "MANAGE_STAFF_PERMISSIONS",
    ],
  },
  ADMIN: {
    label: "مدير المدرسة (الإدارة العامة)",
    description: "إدارة كاملة للمدرسة وشؤونها، قابلة للتعديل والتخصيص من قبل المشرف العام.",
    badge: "مدير المدرسة 👑",
    color: "from-emerald-600 to-teal-600",
    defaultPermissions: [
      "MANAGE_STUDENTS",
      "MANAGE_ATTENDANCE",
      "MANAGE_GRADES",
      "MANAGE_REPORTS",
      "MANAGE_SCHEDULE",
      "MANAGE_TEACHERS",
      "MANAGE_PAYMENTS",
      "MANAGE_EVALUATION",
      "MANAGE_WHATSAPP",
      "MANAGE_BACKUP",
      "MANAGE_SETTINGS",
    ],
  },
  VICE_PRINCIPAL: {
    label: "معاون المدير / المشرف الإداري",
    description: "متابعة الطلاب، الحضور والغياب، اعتماد التقارير، الجداول، وتقييم المعلمين.",
    badge: "معاون المدير 👔",
    color: "from-blue-600 to-cyan-600",
    defaultPermissions: [
      "MANAGE_STUDENTS",
      "MANAGE_ATTENDANCE",
      "MANAGE_REPORTS",
      "MANAGE_SCHEDULE",
      "MANAGE_EVALUATION",
      "MANAGE_WHATSAPP",
    ],
  },
  ACCOUNTANT: {
    label: "محاسب مالي / أمين الصندوق",
    description: "إصدار الوصولات وسندات القبض، متابعة الأقساط، والتقارير المالية.",
    badge: "محاسب مالي 💳",
    color: "from-indigo-600 to-purple-600",
    defaultPermissions: ["MANAGE_PAYMENTS", "MANAGE_STUDENTS"],
  },
  STAFF: {
    label: "موظف إداري / شؤون الطلبة",
    description: "تسجيل الطلاب الجدد، استلام المستمسكات، ومتابعة الحضور والتقارير.",
    badge: "موظف إداري 📋",
    color: "from-teal-600 to-emerald-600",
    defaultPermissions: [
      "MANAGE_STUDENTS",
      "MANAGE_ATTENDANCE",
      "MANAGE_REPORTS",
    ],
  },
  SUPERVISOR: {
    label: "مشرف تربوي / أكاديمي",
    description: "تقييم الكادر التعليمي، فحص الدرجات، ومتابعة الخطط والتقارير اليومية.",
    badge: "مشرف تربوي 🔍",
    color: "from-violet-600 to-indigo-600",
    defaultPermissions: [
      "MANAGE_EVALUATION",
      "MANAGE_REPORTS",
      "MANAGE_GRADES",
      "MANAGE_ATTENDANCE",
    ],
  },
  TEACHER: {
    label: "معلم / مدرس",
    description: "بوابة التدريس الخاصة (رصد حضور الحصة الأولى، التقارير اليومية، رصد درجات مواده).",
    badge: "أستاذ المادة 📚",
    color: "from-sky-600 to-blue-600",
    defaultPermissions: [],
  },
  STUDENT: {
    label: "طالب وولي أمر",
    description: "بوابة الطالب (عرض السعي والدرجات، الواجبات، تقارير الحضور، والوصولات).",
    badge: "طالب 🎓",
    color: "from-amber-600 to-orange-600",
    defaultPermissions: [],
  },
  CUSTOM: {
    label: "دور مخصص (صلاحيات مخصصة يدوياً)",
    description: "تحديد باقة صلاحيات فريدة يتم اختيارها بحرية من قبل المشرف أو المدير.",
    badge: "دور مخصص ⚙️",
    color: "from-fuchsia-600 to-pink-600",
    defaultPermissions: [],
  },
};

/**
 * Returns effective list of permissions for any user object
 */
export function getUserEffectivePermissions(user: {
  role?: string;
  permissionsJson?: string | null;
  isCustomPermissions?: boolean;
}): SystemPermission[] {
  if (!user?.role) return [];

  // Super Admin always has 100% permissions
  if (user.role === "SUPER_ADMIN") {
    return ALL_SYSTEM_PERMISSIONS.map((p) => p.id);
  }

  // If user has custom permissions saved in DB, use them
  if (user.isCustomPermissions && user.permissionsJson) {
    try {
      const parsed = JSON.parse(user.permissionsJson);
      if (Array.isArray(parsed)) {
        return parsed as SystemPermission[];
      }
    } catch {
      // fallback to role preset
    }
  }

  // Otherwise return standard preset for this role
  const preset = SYSTEM_ROLE_PRESETS[user.role];
  if (preset) {
    return preset.defaultPermissions;
  }

  return [];
}

/**
 * Checks if user has a specific permission
 */
export function hasPermission(
  user: {
    role?: string;
    permissionsJson?: string | null;
    isCustomPermissions?: boolean;
  } | null | undefined,
  permission: SystemPermission
): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;

  const permissions = getUserEffectivePermissions(user);
  return permissions.includes(permission);
}

/**
 * Get human-readable role name in Arabic
 */
export function getRoleLabel(role?: string): string {
  if (!role) return "مستخدم";
  return SYSTEM_ROLE_PRESETS[role]?.label || role;
}
