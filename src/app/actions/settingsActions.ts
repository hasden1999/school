"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getPresetForSchoolType } from "@/lib/curriculumPresets";
import {
  generateUniqueFiveLetterUsername,
  generateFiveLetterPasscode,
} from "@/lib/credentialGenerator";

export async function getSchoolSettingsAction() {
  const session = await requireAuth(["ADMIN"]);
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  });

  const classRooms = await prisma.classRoom.findMany({
    where: { tenantId: session.tenantId },
    include: {
      sections: true,
      _count: { select: { studentProfiles: true } },
    },
    orderBy: { orderIndex: "asc" },
  });

  const subjects = await prisma.subject.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { orderIndex: "asc" },
  });

  return { success: true, tenant, classRooms, subjects };
}

/**
 * Synchronizes school classrooms, subjects, AND migrates students according to the selected stage
 */
export async function syncSchoolCurriculumAction(data: {
  schoolType?: string;
  cleanEmptyOldClasses?: boolean;
  migrateStudents?: boolean;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const currentTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!currentTenant) {
    return { error: "المدرسة غير موجودة" };
  }

  const targetType = data.schoolType || currentTenant.schoolType || "ابتدائية أهلية";
  const preset = getPresetForSchoolType(targetType);

  // 1. Fetch existing classrooms and check for student dependencies
  const existingClasses = await prisma.classRoom.findMany({
    where: { tenantId },
    include: {
      studentProfiles: true,
      sections: true,
    },
  });

  // 2. Create or Update Classrooms for the new stage
  const createdOrUpdatedClasses: any[] = [];

  for (const pClass of preset.classRooms) {
    const existing = existingClasses.find(
      (c) => c.code === pClass.code || c.name === pClass.name
    );

    if (existing) {
      const updated = await prisma.classRoom.update({
        where: { id: existing.id },
        data: {
          name: pClass.name,
          code: pClass.code,
          annualTuition: existing.annualTuition || pClass.tuition,
          orderIndex: pClass.orderIndex,
          isGraduatingClass: !!pClass.isGraduatingClass,
        },
        include: { sections: true },
      });

      // Ensure default section 'أ' exists
      if (updated.sections.length === 0) {
        const sec = await prisma.section.create({
          data: {
            tenantId,
            classRoomId: existing.id,
            name: "أ",
          },
        });
        updated.sections.push(sec);
      }
      createdOrUpdatedClasses.push(updated);
    } else {
      const created = await prisma.classRoom.create({
        data: {
          tenantId,
          name: pClass.name,
          code: pClass.code,
          annualTuition: pClass.tuition,
          orderIndex: pClass.orderIndex,
          isGraduatingClass: !!pClass.isGraduatingClass,
          sections: {
            create: {
              tenantId,
              name: "أ",
            },
          },
        },
        include: { sections: true },
      });
      createdOrUpdatedClasses.push(created);
    }
  }

  // 3. Migrate students from obsolete non-preset classes to the new stage classes
  let migratedStudentsCount = 0;
  const shouldMigrate = data.migrateStudents !== false;
  const targetFirstClass = createdOrUpdatedClasses[0];
  const targetFirstSection = targetFirstClass?.sections?.[0];

  const presetCodes = new Set(preset.classRooms.map((c) => c.code));
  const presetNames = new Set(preset.classRooms.map((c) => c.name));

  for (const oldClass of existingClasses) {
    const isPartOfNewPreset = presetCodes.has(oldClass.code) || presetNames.has(oldClass.name);

    if (!isPartOfNewPreset) {
      if (shouldMigrate && oldClass.studentProfiles.length > 0 && targetFirstClass && targetFirstSection) {
        for (const stu of oldClass.studentProfiles) {
          await prisma.studentProfile.update({
            where: { id: stu.id },
            data: {
              classRoomId: targetFirstClass.id,
              sectionId: targetFirstSection.id,
            },
          });
          migratedStudentsCount++;
        }
      }

      // If class is now empty, delete it
      if (data.cleanEmptyOldClasses !== false) {
        try {
          await prisma.classRoom.delete({ where: { id: oldClass.id } });
        } catch (e) {
          // ignore
        }
      }
    }
  }

  // 4. Create or Update Standard Stage Subjects
  const existingSubjects = await prisma.subject.findMany({
    where: { tenantId },
  });

  for (const pSub of preset.subjects) {
    const existing = existingSubjects.find(
      (s) => s.code === pSub.code || s.name === pSub.name
    );

    if (existing) {
      await prisma.subject.update({
        where: { id: existing.id },
        data: {
          name: pSub.name,
          code: pSub.code,
          orderIndex: pSub.orderIndex,
        },
      });
    } else {
      await prisma.subject.create({
        data: {
          tenantId,
          name: pSub.name,
          code: pSub.code,
          orderIndex: pSub.orderIndex,
        },
      });
    }
  }

  // Update tenant's active school type
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { schoolType: targetType },
  });

  // Comprehensive Cache & Route Revalidation
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/students");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/reports");
  revalidatePath("/teacher/attendance");
  revalidatePath("/teacher/grades");

  const migrationText =
    migratedStudentsCount > 0
      ? ` وتم ترحيل وتوزيع (${migratedStudentsCount}) طالب إلى الصفوف الجديدة`
      : "";

  return {
    success: true,
    message: `تمت مواءمة المنظومة بنجاح لتشمل صفوف ومناهج (${preset.stageTitle})${migrationText}`,
    stageTitle: preset.stageTitle,
    classRoomsCount: preset.classRooms.length,
    subjectsCount: preset.subjects.length,
    migratedStudentsCount,
  };
}

/**
 * Generates sample realistic Iraqi students for all classrooms of the current stage
 */
export async function generateSampleStageStudentsAction(data: {
  studentsPerClass?: number;
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

  if (!tenant || tenant.classRooms.length === 0) {
    return { error: "لم يتم العثور على صفوف دراسية في المدرسة، يرجى مواءمة المرحلة أولاً" };
  }

  const sampleNames = [
    { name: "كرار حيدر علي", guardian: "حيدر علي عبد الحسين", phone: "07701112233" },
    { name: "زينب محمد كاظم", guardian: "محمد كاظم الموسوي", phone: "07802223344" },
    { name: "علي حسين مهدي", guardian: "حسين مهدي العامري", phone: "07713334455" },
    { name: "فاطمة عمر ناصر", guardian: "عمر ناصر الجبوري", phone: "07504445566" },
    { name: "مريم عباس فاضل", guardian: "عباس فاضل الخفاجي", phone: "07725556677" },
    { name: "مصطفى أحمد رشيد", guardian: "أحمد رشيد الساعدي", phone: "07816667788" },
    { name: "هدى سامي كريم", guardian: "سامي كريم الشمري", phone: "07737778899" },
    { name: "يوسف خالد جاسم", guardian: "خالد جاسم التميمي", phone: "07518889900" },
    { name: "زهراء عبد الله حسن", guardian: "عبد الله حسن الزيدي", phone: "07749990011" },
    { name: "سجاد رائد طارق", guardian: "رائد طارق الربيعي", phone: "07820001122" },
  ];

  const perClass = data.studentsPerClass || 2;
  let totalCreated = 0;
  let nameIndex = 0;

  for (const c of tenant.classRooms) {
    const section = c.sections[0] || (await prisma.section.create({
      data: { tenantId, classRoomId: c.id, name: "أ" },
    }));

    for (let i = 0; i < perClass; i++) {
      const sample = sampleNames[nameIndex % sampleNames.length];
      nameIndex++;

      const username = await generateUniqueFiveLetterUsername(tenantId);
      const passcode = generateFiveLetterPasscode();
      const passwordHash = await hashPassword(passcode);

      const stuNumber = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const user = await prisma.user.create({
        data: {
          tenantId,
          username,
          fullName: `${sample.name} (${c.name.split(" ")[0]})`,
          passwordHash,
          plainPasscode: passcode,
          phone: sample.phone,
          role: "STUDENT",
          active: true,
        },
      });

      const stuProfile = await prisma.studentProfile.create({
        data: {
          tenantId,
          userId: user.id,
          classRoomId: c.id,
          sectionId: section.id,
          studentNumber: stuNumber,
          guardianName: sample.guardian,
          guardianPhone: sample.phone,
          totalTuition: c.annualTuition || 1500000,
          depositAmount: 250000,
          registrationStatus: "ACTIVE",
        },
      });

      // Add initial receipt
      await prisma.paymentReceipt.create({
        data: {
          tenantId,
          studentId: stuProfile.id,
          receiptNumber: `REC-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`,
          amount: 250000,
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod: "CASH",
          notes: "عربون تثبيت المقعد المالي",
          receivedByUserId: session.id,
        },
      });

      totalCreated++;
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/students");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    message: `تم بنجاح توليد وتوزيع (${totalCreated}) طالب تجريبي ببيانات عراقية واقعية على كافة صفوف (${tenant.name})! 🎓`,
    totalCreated,
  };
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
  syncCurriculum?: boolean;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  if (!data.name || data.name.trim().length < 3) {
    return { error: "يرجى كتابة اسم المدرسة الرسمي بشكل صحيح (3 أحرف على الأقل)." };
  }

  const prevTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  const isSchoolTypeChanged =
    prevTenant && prevTenant.schoolType !== data.schoolType;

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
      printFooterText:
        data.printFooterText?.trim() ||
        "وثيقة رسمية صادرة من إدارة المدرسة — أي كشط أو تحبير يعتبر لاغياً",
    },
  });

  // If school type changed or sync was requested, synchronize classrooms, subjects & students
  if (data.syncCurriculum !== false && (isSchoolTypeChanged || data.syncCurriculum)) {
    await syncSchoolCurriculumAction({
      schoolType: data.schoolType,
      cleanEmptyOldClasses: true,
      migrateStudents: true,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/students");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/reports");

  return { success: true, tenant: updatedTenant };
}
