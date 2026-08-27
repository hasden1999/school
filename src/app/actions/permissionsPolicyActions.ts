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
  expiresAt?: string | null; // ISO Date String for temporary access
  durationLabel?: string;    // e.g. "3 أيام", "أسبوع", "دائم"
}

export interface StudentOverridePolicy {
  studentId: string;
  userId: string;
  allowViewClassGrades: boolean;
  isClassRepresentative: boolean;
  canViewReports: boolean;
  expiresAt?: string | null;
  durationLabel?: string;
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

  const now = new Date();

  const enhancedClasses = classRooms.map((cls) => {
    const policy = policiesMap[cls.id] || {};
    
    // Check if temporary policy has expired
    let isExpired = false;
    if (policy.expiresAt) {
      const expDate = new Date(policy.expiresAt);
      if (now > expDate) {
        isExpired = true;
      }
    }

    const activeViewFull = isExpired ? false : (policy.allowViewFullClassGrades ?? false);

    return {
      ...cls,
      allowViewFullClassGrades: activeViewFull,
      allowViewHonorRoll: policy.allowViewHonorRoll ?? true,
      allowSubmitLeaves: policy.allowSubmitLeaves ?? true,
      allowTeacherEvaluation: policy.allowTeacherEvaluation ?? true,
      expiresAt: policy.expiresAt || null,
      durationLabel: policy.durationLabel || (activeViewFull ? "دائم" : null),
      isExpired,
    };
  });

  return { classRooms: enhancedClasses };
}

/**
 * Update permission policy for a specific class with duration presets (24H, 3D, 7D, PERMANENT)
 */
export async function updateClassPermissionPolicyAction(
  classRoomId: string,
  policy: Partial<ClassPermissionPolicy> & { durationPreset?: "24H" | "3D" | "7D" | "TERM" | "PERMANENT" }
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

  // Calculate expiration date if preset provided
  let expiresAt: string | null = null;
  let durationLabel = "دائم";

  if (policy.durationPreset === "24H") {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    durationLabel = "24 ساعة";
  } else if (policy.durationPreset === "3D") {
    expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    durationLabel = "3 أيام";
  } else if (policy.durationPreset === "7D") {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    durationLabel = "أسبوع واحد";
  } else if (policy.durationPreset === "TERM") {
    expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    durationLabel = "الفصل الدراسي";
  } else if (policy.durationPreset === "PERMANENT") {
    expiresAt = null;
    durationLabel = "دائم";
  }

  currentConfig.classPolicies[classRoomId] = {
    ...(currentConfig.classPolicies[classRoomId] || {}),
    ...policy,
    expiresAt: expiresAt !== undefined ? expiresAt : (currentConfig.classPolicies[classRoomId]?.expiresAt ?? null),
    durationLabel: durationLabel || currentConfig.classPolicies[classRoomId]?.durationLabel,
  };

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      printFooterText: JSON.stringify(currentConfig),
    },
  });

  revalidatePath("/admin/permissions");
  revalidatePath("/student/grades");

  return { success: true, expiresAt, durationLabel };
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

  const now = new Date();

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

    let isExpired = false;
    if (overrides.expiresAt) {
      if (now > new Date(overrides.expiresAt)) {
        isExpired = true;
      }
    }

    const allowView = isExpired ? false : (overrides.allowViewClassGrades ?? false);

    return {
      id: s.id,
      userId: s.userId,
      studentNumber: s.studentNumber,
      fullName: s.user?.fullName || s.guardianName,
      username: s.user?.username || "—",
      guardianPhone: s.guardianPhone,
      className: `${s.classRoom?.name || ""} (${s.section?.name || ""})`,
      classRoomId: s.classRoomId,
      allowViewClassGrades: allowView,
      isClassRepresentative: overrides.isClassRepresentative ?? false,
      canViewReports: overrides.canViewReports ?? true,
      expiresAt: overrides.expiresAt || null,
      durationLabel: overrides.durationLabel || (allowView ? "دائم" : null),
      isExpired,
      notes: overrides.notes || "",
    };
  });

  return { students: parsedStudents };
}

/**
 * Update override policy for a specific student with duration
 */
export async function updateStudentOverrideAction(
  userId: string,
  overrides: {
    allowViewClassGrades: boolean;
    isClassRepresentative: boolean;
    canViewReports: boolean;
    durationPreset?: "24H" | "3D" | "7D" | "TERM" | "PERMANENT";
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

  let expiresAt: string | null = null;
  let durationLabel = "دائم";

  if (overrides.durationPreset === "24H") {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    durationLabel = "24 ساعة";
  } else if (overrides.durationPreset === "3D") {
    expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    durationLabel = "3 أيام";
  } else if (overrides.durationPreset === "7D") {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    durationLabel = "أسبوع واحد";
  } else if (overrides.durationPreset === "TERM") {
    expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    durationLabel = "الفصل الدراسي";
  }

  const payload = {
    ...overrides,
    expiresAt,
    durationLabel,
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      permissionsJson: JSON.stringify(payload),
      isCustomPermissions: true,
    },
  });

  revalidatePath("/admin/permissions");
  revalidatePath("/student/grades");
  revalidatePath("/student/dashboard");

  return { success: true, expiresAt, durationLabel };
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
  const now = new Date();

  // 1. Check student-specific override
  let studentOverrideAllowed = false;
  let remainingDays: number | null = null;

  if (studentUser.permissionsJson) {
    try {
      const parsed = JSON.parse(studentUser.permissionsJson);
      if (parsed.allowViewClassGrades) {
        if (!parsed.expiresAt || now <= new Date(parsed.expiresAt)) {
          studentOverrideAllowed = true;
          if (parsed.expiresAt) {
            remainingDays = Math.max(1, Math.ceil((new Date(parsed.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          }
        }
      }
    } catch {}
  }

  // 2. Check class-level policy
  let classPolicyAllowed = false;
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (tenant?.printFooterText && tenant.printFooterText.startsWith("{")) {
    try {
      const parsed = JSON.parse(tenant.printFooterText);
      const classPol = parsed.classPolicies?.[profile.classRoomId];
      if (classPol?.allowViewFullClassGrades) {
        if (!classPol.expiresAt || now <= new Date(classPol.expiresAt)) {
          classPolicyAllowed = true;
          if (classPol.expiresAt && !remainingDays) {
            remainingDays = Math.max(1, Math.ceil((new Date(classPol.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          }
        }
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
    remainingDays,
    classmates,
    subjects,
  };
}
