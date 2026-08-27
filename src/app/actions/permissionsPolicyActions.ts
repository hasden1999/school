"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ClassPermissionPolicy {
  classRoomId: string;
  allowViewFullClassGrades: boolean;
  allowViewHonorRoll: boolean;
  allowSubmitLeaves: boolean;
  allowTeacherEvaluation: boolean;
}

export interface StudentOverridePolicy {
  studentId: string;
  userId: string;
  allowViewClassGrades: boolean;
  isClassRepresentative: boolean;
  canViewReports: boolean;
  notes?: string;
}

/**
 * Fetch all classrooms with their permission policies
 */
export async function getClassPermissionsPoliciesAction() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const classRooms = await prisma.classRoom.findMany({
    where: { tenantId },
    include: {
      sections: true,
      _count: {
        select: { studentProfiles: true },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { printFooterText: true },
  });

  // Parse policies from printFooterText JSON or fallback defaults
  let policiesMap: Record<string, Partial<ClassPermissionPolicy>> = {};
  if (tenant?.printFooterText && tenant.printFooterText.startsWith("{")) {
    try {
      const parsed = JSON.parse(tenant.printFooterText);
      if (parsed.classPolicies) {
        policiesMap = parsed.classPolicies;
      }
    } catch {
      // fallback
    }
  }

  const enhancedClasses = classRooms.map((cls) => {
    const policy = policiesMap[cls.id] || {};
    return {
      ...cls,
      allowViewFullClassGrades: policy.allowViewFullClassGrades ?? false,
      allowViewHonorRoll: policy.allowViewHonorRoll ?? true,
      allowSubmitLeaves: policy.allowSubmitLeaves ?? true,
      allowTeacherEvaluation: policy.allowTeacherEvaluation ?? true,
    };
  });

  return { classRooms: enhancedClasses };
}

/**
 * Update permission policy for a specific class or all classes
 */
export async function updateClassPermissionPolicyAction(
  classRoomId: string,
  policy: Partial<ClassPermissionPolicy>
) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  let currentConfig: any = {};
  if (tenant?.printFooterText && tenant.printFooterText.startsWith("{")) {
    try {
      currentConfig = JSON.parse(tenant.printFooterText);
    } catch {
      currentConfig = {};
    }
  }

  if (!currentConfig.classPolicies) {
    currentConfig.classPolicies = {};
  }

  currentConfig.classPolicies[classRoomId] = {
    ...(currentConfig.classPolicies[classRoomId] || {}),
    ...policy,
  };

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      printFooterText: JSON.stringify(currentConfig),
    },
  });

  revalidatePath("/admin/permissions");
  revalidatePath("/student/grades");

  return { success: true };
}

/**
 * Fetch all students with their active overrides
 */
export async function getStudentOverridesAction() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const students = await prisma.studentProfile.findMany({
    where: { tenantId },
    include: {
      user: true,
      classRoom: true,
      section: true,
    },
    orderBy: { studentNumber: "asc" },
  });

  const parsedStudents = students.map((s) => {
    let overrides: any = {};
    if (s.user?.permissionsJson) {
      try {
        const parsed = JSON.parse(s.user.permissionsJson);
        if (typeof parsed === "object" && !Array.isArray(parsed)) {
          overrides = parsed;
        }
      } catch {}
    }

    return {
      id: s.id,
      userId: s.userId,
      studentNumber: s.studentNumber,
      fullName: s.user?.fullName || s.guardianName,
      username: s.user?.username || "—",
      guardianPhone: s.guardianPhone,
      className: `${s.classRoom?.name || ""} (${s.section?.name || ""})`,
      classRoomId: s.classRoomId,
      allowViewClassGrades: overrides.allowViewClassGrades ?? false,
      isClassRepresentative: overrides.isClassRepresentative ?? false,
      canViewReports: overrides.canViewReports ?? true,
      notes: overrides.notes || "",
    };
  });

  return { students: parsedStudents };
}

/**
 * Update override policy for a specific student
 */
export async function updateStudentOverrideAction(
  userId: string,
  overrides: {
    allowViewClassGrades: boolean;
    isClassRepresentative: boolean;
    canViewReports: boolean;
    notes?: string;
  }
) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.tenantId !== tenantId) {
    return { error: "سجل الطالب غير موجود" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      permissionsJson: JSON.stringify(overrides),
      isCustomPermissions: true,
    },
  });

  revalidatePath("/admin/permissions");
  revalidatePath("/student/grades");
  revalidatePath("/student/dashboard");

  return { success: true };
}

/**
 * Check if student has permission to view full class grades and fetch them if allowed
 */
export async function getFullClassGradesForStudentAction(studentUserId: string) {
  const studentUser = await prisma.user.findUnique({
    where: { id: studentUserId },
    include: {
      studentProfile: {
        include: {
          classRoom: true,
          section: true,
        },
      },
    },
  });

  if (!studentUser || !studentUser.studentProfile) {
    return { allowed: false, error: "الطالب غير موجود" };
  }

  const profile = studentUser.studentProfile;
  const tenantId = studentUser.tenantId;

  // 1. Check student-specific override
  let studentOverrideAllowed = false;
  if (studentUser.permissionsJson) {
    try {
      const parsed = JSON.parse(studentUser.permissionsJson);
      if (parsed.allowViewClassGrades) {
        studentOverrideAllowed = true;
      }
    } catch {}
  }

  // 2. Check class-level policy
  let classPolicyAllowed = false;
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (tenant?.printFooterText && tenant.printFooterText.startsWith("{")) {
    try {
      const parsed = JSON.parse(tenant.printFooterText);
      if (parsed.classPolicies?.[profile.classRoomId]?.allowViewFullClassGrades) {
        classPolicyAllowed = true;
      }
    } catch {}
  }

  const isAllowed = studentOverrideAllowed || classPolicyAllowed;
  if (!isAllowed) {
    return { allowed: false };
  }

  // Fetch all classmates and their grade records in this section
  const classmates = await prisma.studentProfile.findMany({
    where: {
      tenantId,
      classRoomId: profile.classRoomId,
      sectionId: profile.sectionId,
      registrationStatus: "ACTIVE",
    },
    include: {
      user: {
        select: { fullName: true, username: true },
      },
      gradeRecords: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { user: { fullName: "asc" } },
  });

  // Fetch subjects for this classroom
  const subjects = await prisma.subject.findMany({
    where: { tenantId },
    orderBy: { orderIndex: "asc" },
  });

  return {
    allowed: true,
    className: `${profile.classRoom.name} - الشعبة (${profile.section.name})`,
    classmates,
    subjects,
  };
}
