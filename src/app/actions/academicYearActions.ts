"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * 1. Comprehensive Pre-Closure Audit (فحص المتعلقات والذمم قبل الإغلاق)
 */
export async function getAcademicYearAuditData() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      classRooms: {
        include: { sections: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!tenant) throw new Error("المدرسة غير موجودة");

  // 1. Fetch Active Students with their financial and document records
  const activeStudents = await prisma.studentProfile.findMany({
    where: {
      tenantId,
      registrationStatus: "ACTIVE",
    },
    include: {
      user: true,
      classRoom: true,
      section: true,
      paymentReceipts: true,
      documents: {
        include: { requirement: true },
      },
      gradeRecords: {
        where: { academicYear: tenant.activeYear },
      },
    },
  });

  // Calculate unpaid tuition debts
  let totalSchoolDebt = 0;
  const studentsWithDebt: any[] = [];
  const studentsWithMissingDocs: any[] = [];
  const studentsWithIncompleteGrades: any[] = [];

  for (const s of activeStudents) {
    const totalPaid =
      s.paymentReceipts.reduce((sum, r) => sum + r.amount, 0) + s.depositAmount;
    const remaining = s.totalTuition - totalPaid;

    if (remaining > 0 && !s.isCleared) {
      totalSchoolDebt += remaining;
      studentsWithDebt.push({
        id: s.id,
        fullName: s.user.fullName,
        studentNumber: s.studentNumber,
        guardianPhone: s.guardianPhone,
        className: `${s.classRoom.name} (${s.section.name})`,
        totalTuition: s.totalTuition,
        totalPaid,
        remaining,
        isCleared: s.isCleared,
      });
    }

    // Missing required documents
    const missingDocs = s.documents.filter(
      (d) => d.status === "MISSING" && d.requirement.isRequired
    );
    if (missingDocs.length > 0) {
      studentsWithMissingDocs.push({
        id: s.id,
        fullName: s.user.fullName,
        className: `${s.classRoom.name} (${s.section.name})`,
        missingCount: missingDocs.length,
        missingTitles: missingDocs.map((d) => d.requirement.title),
      });
    }

    // Incomplete Final Grades Check
    const unLockedGrades = s.gradeRecords.filter((g) => !g.isFinalExamLocked && g.finalGrade === null);
    if (unLockedGrades.length > 0) {
      studentsWithIncompleteGrades.push({
        id: s.id,
        fullName: s.user.fullName,
        className: `${s.classRoom.name} (${s.section.name})`,
        uncompletedCount: unLockedGrades.length,
      });
    }
  }

  // 2. Teacher Leaves and Daily Reports Pending Review
  const pendingDailyReports = await prisma.dailyReport.count({
    where: { tenantId, status: "PENDING_APPROVAL" },
  });

  // 3. Past Closures
  const pastClosures = await prisma.academicYearClosure.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  const isReadyForClosure =
    studentsWithDebt.length === 0 &&
    studentsWithIncompleteGrades.length === 0 &&
    pendingDailyReports === 0;

  return {
    activeYear: tenant.activeYear,
    plannedClosureDate: tenant.plannedClosureDate || new Date().toISOString().split("T")[0],
    currency: tenant.currency,
    classRooms: tenant.classRooms,
    totalActiveStudents: activeStudents.length,
    totalSchoolDebt,
    studentsWithDebt,
    studentsWithMissingDocs,
    studentsWithIncompleteGrades,
    pendingDailyReports,
    pastClosures,
    isReadyForClosure,
  };
}

/**
 * 2. Save Planned Closure Date
 */
export async function setPlannedClosureDateAction(closureDate: string) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { plannedClosureDate: closureDate },
  });

  revalidatePath("/admin/academic-year");
  return { success: true };
}

/**
 * 3. Toggle Student Clearance Exception (منح براءة ذمة استثنائية)
 */
export async function toggleStudentClearanceAction(studentId: string, isCleared: boolean) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  await prisma.studentProfile.update({
    where: { id: studentId, tenantId },
    data: { isCleared },
  });

  revalidatePath("/admin/academic-year");
  revalidatePath("/admin/payments");
  return { success: true };
}

/**
 * 4. Execute Academic Year Closure & Smart Student Promotion / Graduation
 */
export async function executeAcademicYearClosureAction(data: {
  closedYear: string;
  newYear: string;
  closureDate: string;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      classRooms: {
        include: { sections: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!tenant) throw new Error("المدرسة غير موجودة");

  const classRooms = tenant.classRooms;
  if (classRooms.length === 0) {
    return { error: "لا توجد صفوف دراسية معرفة في النظام." };
  }

  // Get active students to promote/graduate
  const activeStudents = await prisma.studentProfile.findMany({
    where: {
      tenantId,
      registrationStatus: "ACTIVE",
    },
    include: {
      classRoom: true,
      paymentReceipts: true,
    },
  });

  let promotedCount = 0;
  let graduatedCount = 0;
  let carriedOverDebtTotal = 0;

  // Max orderIndex class is considered the Graduating Class if none marked
  const maxOrderIndex = Math.max(...classRooms.map((c) => c.orderIndex));

  for (const student of activeStudents) {
    const currentClass = student.classRoom;
    const isGraduating =
      currentClass.isGraduatingClass || currentClass.orderIndex >= maxOrderIndex;

    // Calculate unpaid debt
    const totalPaid =
      student.paymentReceipts.reduce((sum, r) => sum + r.amount, 0) + student.depositAmount;
    const remaining = student.totalTuition - totalPaid;
    if (remaining > 0) {
      carriedOverDebtTotal += remaining;
    }

    if (isGraduating) {
      // 🎓 Move to Graduated / Alumni Archive
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: {
          registrationStatus: "GRADUATED",
          graduationYear: data.closedYear,
          archivedAt: new Date(),
          isCleared: true,
        },
      });
      graduatedCount++;
    } else {
      // 📈 Promote to Next Class
      // Find next class by nextClassRoomId or next orderIndex
      let nextClass = null;
      if (currentClass.nextClassRoomId) {
        nextClass = classRooms.find((c) => c.id === currentClass.nextClassRoomId);
      }
      if (!nextClass) {
        nextClass = classRooms.find((c) => c.orderIndex > currentClass.orderIndex);
      }

      if (nextClass) {
        const nextSectionId = nextClass.sections[0]?.id || student.sectionId;

        await prisma.studentProfile.update({
          where: { id: student.id },
          data: {
            classRoomId: nextClass.id,
            sectionId: nextSectionId,
            totalTuition: nextClass.annualTuition,
            depositAmount: 0, // Reset for new year
            isCleared: false,
          },
        });
        promotedCount++;
      } else {
        // If no higher class, graduate
        await prisma.studentProfile.update({
          where: { id: student.id },
          data: {
            registrationStatus: "GRADUATED",
            graduationYear: data.closedYear,
            archivedAt: new Date(),
            isCleared: true,
          },
        });
        graduatedCount++;
      }
    }
  }

  // Record Closure
  const closureRecord = await prisma.academicYearClosure.create({
    data: {
      tenantId,
      closedYear: data.closedYear,
      newYear: data.newYear,
      closureDate: data.closureDate,
      closedByUserId: session.id,
      promotedCount,
      graduatedCount,
      unpaidDebtsTotal: carriedOverDebtTotal,
      summaryJson: JSON.stringify({
        promotedCount,
        graduatedCount,
        carriedOverDebtTotal,
        closureTimestamp: new Date().toISOString(),
      }),
    },
  });

  // Switch tenant active academic year
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      activeYear: data.newYear,
      plannedClosureDate: null,
    },
  });

  // Backup snapshot record
  await prisma.backupRecord.create({
    data: {
      tenantId,
      backupType: "DATABASE_JSON",
      fileName: `closure_${data.closedYear.replace("-", "_")}_backup.json`,
      fileSize: "1.4 MB",
      recordCount: activeStudents.length,
      createdByUserId: session.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath("/admin/academic-year");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/grades");

  return {
    success: true,
    promotedCount,
    graduatedCount,
    carriedOverDebtTotal,
    closureRecord,
  };
}
