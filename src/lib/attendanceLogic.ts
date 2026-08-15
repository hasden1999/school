/**
 * Attendance Logic & Period 1 Assignment Verification
 */

export const DAYS_OF_WEEK = [
  { key: "SUNDAY", label: "الأحد", dayIndex: 0 },
  { key: "MONDAY", label: "الإثنين", dayIndex: 1 },
  { key: "TUESDAY", label: "الثلاثاء", dayIndex: 2 },
  { key: "WEDNESDAY", label: "الأربعاء", dayIndex: 3 },
  { key: "THURSDAY", label: "الخميس", dayIndex: 4 },
] as const;

export function getCurrentDayKey(dateObj = new Date()): string {
  const dayIndex = dateObj.getDay(); // 0 is Sunday, 1 is Monday...
  const found = DAYS_OF_WEEK.find((d) => d.dayIndex === dayIndex);
  return found ? found.key : "SUNDAY";
}

export function getCurrentDayArabicName(dateObj = new Date()): string {
  const dayIndex = dateObj.getDay();
  const found = DAYS_OF_WEEK.find((d) => d.dayIndex === dayIndex);
  return found ? found.label : "الأحد";
}

export interface Period1CheckResult {
  canTakeAttendance: boolean;
  assignedTeacherName?: string;
  isPeriod1Teacher: boolean;
  isAdminOverride: boolean;
  message: string;
}

export function verifyPeriod1AttendancePermission(
  currentUserId: string,
  userRole: string,
  period1TeacherId?: string | null,
  period1TeacherName?: string | null
): Period1CheckResult {
  // Admin ALWAYS has full safety override
  if (userRole === "ADMIN") {
    return {
      canTakeAttendance: true,
      assignedTeacherName: period1TeacherName || "غير محدد بالجدول",
      isPeriod1Teacher: currentUserId === period1TeacherId,
      isAdminOverride: true,
      message: "صلاحية الإدارة الشاملة (Override)",
    };
  }

  // If user is the designated period 1 teacher
  if (period1TeacherId && currentUserId === period1TeacherId) {
    return {
      canTakeAttendance: true,
      assignedTeacherName: period1TeacherName || "أنت",
      isPeriod1Teacher: true,
      isAdminOverride: false,
      message: "أنت معلم الحصة الأولى لهذا الصف اليوم - مصرح برصد الحضور",
    };
  }

  // Not period 1 teacher
  return {
    canTakeAttendance: false,
    assignedTeacherName: period1TeacherName || "المعلم المكلف",
    isPeriod1Teacher: false,
    isAdminOverride: false,
    message: `الحضور من مسؤولية أ. ${formatTeacherName(period1TeacherName || "معلم الحصة الأولى")} - الحصة الأولى`,
  };
}

export function formatTeacherName(name?: string | null): string {
  if (!name) return "";
  // Strip duplicate prefixes like "أ. " or "أ.أ. "
  let cleaned = name.replace(/^(أ\.\s*)+/g, "").trim();
  // Strip parenthetical text like "(مدرس الرياضيات)" or "(مدرس العلوم والفيزياء)"
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, "").trim();
  return `أ. ${cleaned}`;
}
