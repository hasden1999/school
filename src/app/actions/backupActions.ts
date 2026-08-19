"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { runNightlyDatabaseBackup } from "@/lib/cronEngine";
import { revalidatePath } from "next/cache";

export async function createDatabaseBackupAction() {
  const session = await requireAuth(["ADMIN"]);
  const report = await runNightlyDatabaseBackup(session.tenantId, session.id);
  revalidatePath("/admin/backup");
  return report;
}

/**
 * Restore school data from JSON backup atomically
 */
export async function restoreDatabaseBackupAction(backupJsonString: string) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  try {
    const data = typeof backupJsonString === "string" ? JSON.parse(backupJsonString) : backupJsonString;

    if (!data || typeof data !== "object") {
      return { success: false, error: "ملف النسخة الاحتياطية غير صالح أو تالف." };
    }

    const result = await prisma.$transaction(
      async (tx) => {
        let restoredStudents = 0;
        let restoredPayments = 0;
        let restoredClasses = 0;
        let restoredSubjects = 0;

        // 1. Restore Classrooms & Sections
        if (Array.isArray(data.classRooms)) {
          for (const c of data.classRooms) {
            const classRoom = await tx.classRoom.upsert({
              where: { tenantId_code: { tenantId, code: c.code || c.name } },
              update: {
                name: c.name,
                annualTuition: Number(c.annualTuition) || 1500000,
                orderIndex: Number(c.orderIndex) || 0,
              },
              create: {
                tenantId,
                name: c.name,
                code: c.code || c.name,
                annualTuition: Number(c.annualTuition) || 1500000,
                orderIndex: Number(c.orderIndex) || 0,
              },
            });
            restoredClasses++;

            // Restore sections for this class
            if (Array.isArray(c.sections)) {
              for (const sec of c.sections) {
                await tx.section.upsert({
                  where: {
                    tenantId_classRoomId_name: {
                      tenantId,
                      classRoomId: classRoom.id,
                      name: sec.name,
                    },
                  },
                  update: {},
                  create: {
                    tenantId,
                    classRoomId: classRoom.id,
                    name: sec.name,
                  },
                });
              }
            }
          }
        }

        // 2. Restore Subjects
        if (Array.isArray(data.subjects)) {
          for (const s of data.subjects) {
            await tx.subject.upsert({
              where: { tenantId_code: { tenantId, code: s.code || s.name } },
              update: { name: s.name, orderIndex: Number(s.orderIndex) || 0 },
              create: {
                tenantId,
                name: s.name,
                code: s.code || s.name,
                orderIndex: Number(s.orderIndex) || 0,
              },
            });
            restoredSubjects++;
          }
        }

        // 3. Restore Students & User Accounts
        if (Array.isArray(data.students)) {
          for (const stu of data.students) {
            const username = stu.user?.username || `stu_${stu.studentNumber?.toLowerCase().replace(/[^a-z0-9]/g, "") || Math.random().toString(36).slice(2, 7)}`;
            const fullName = stu.user?.fullName || stu.guardianName || "طالب مستعاد";

            const user = await tx.user.upsert({
              where: { tenantId_username: { tenantId, username } },
              update: {
                fullName,
                phone: stu.guardianPhone || stu.user?.phone,
              },
              create: {
                tenantId,
                username,
                passwordHash: stu.user?.passwordHash || "$2a$10$3YdJtVjI89J2aR45vN4n3eEw.zV4e1oN1x2y3z4a5b6c7d8e9f0g1",
                plainPasscode: stu.user?.plainPasscode || "12345",
                fullName,
                phone: stu.guardianPhone || stu.user?.phone,
                role: "STUDENT",
              },
            });

            // Find matching classroom & section
            let targetClassId = stu.classRoomId;
            let targetSectionId = stu.sectionId;

            if (stu.classRoom?.code) {
              const matchedClass = await tx.classRoom.findFirst({
                where: { tenantId, code: stu.classRoom.code },
              });
              if (matchedClass) targetClassId = matchedClass.id;
            }

            if (!targetClassId) {
              const defaultClass = await tx.classRoom.findFirst({ where: { tenantId } });
              if (defaultClass) targetClassId = defaultClass.id;
            }

            if (targetClassId && (!targetSectionId || stu.section?.name)) {
              const matchedSection = await tx.section.findFirst({
                where: { tenantId, classRoomId: targetClassId },
              });
              if (matchedSection) targetSectionId = matchedSection.id;
            }

            if (targetClassId && targetSectionId) {
              await tx.studentProfile.upsert({
                where: {
                  tenantId_studentNumber: {
                    tenantId,
                    studentNumber: stu.studentNumber || `STU-${Math.floor(Math.random() * 9000 + 1000)}`,
                  },
                },
                update: {
                  guardianName: stu.guardianName || fullName,
                  guardianPhone: stu.guardianPhone || "07700000000",
                  totalTuition: Number(stu.totalTuition) || 1500000,
                  depositAmount: Number(stu.depositAmount) || 0,
                  registrationStatus: stu.registrationStatus || "ACTIVE",
                  classRoomId: targetClassId,
                  sectionId: targetSectionId,
                },
                create: {
                  tenantId,
                  userId: user.id,
                  studentNumber: stu.studentNumber || `STU-${Math.floor(Math.random() * 9000 + 1000)}`,
                  guardianName: stu.guardianName || fullName,
                  guardianPhone: stu.guardianPhone || "07700000000",
                  totalTuition: Number(stu.totalTuition) || 1500000,
                  depositAmount: Number(stu.depositAmount) || 0,
                  registrationStatus: stu.registrationStatus || "ACTIVE",
                  classRoomId: targetClassId,
                  sectionId: targetSectionId,
                },
              });
              restoredStudents++;
            }
          }
        }

        // 4. Restore Payment Receipts
        if (Array.isArray(data.paymentReceipts)) {
          for (const pay of data.paymentReceipts) {
            if (pay.receiptNumber) {
              // Find student profile in this tenant
              const student = await tx.studentProfile.findFirst({
                where: { tenantId, id: pay.studentId },
              });

              if (student) {
                await tx.paymentReceipt.upsert({
                  where: {
                    tenantId_receiptNumber: {
                      tenantId,
                      receiptNumber: pay.receiptNumber,
                    },
                  },
                  update: {
                    amount: Number(pay.amount),
                    paymentDate: pay.paymentDate,
                    notes: pay.notes,
                  },
                  create: {
                    tenantId,
                    studentId: student.id,
                    receiptNumber: pay.receiptNumber,
                    amount: Number(pay.amount),
                    paymentDate: pay.paymentDate,
                    paymentMethod: pay.paymentMethod || "CASH",
                    notes: pay.notes,
                    receivedByUserId: session.id,
                  },
                });
                restoredPayments++;
              }
            }
          }
        }

        return {
          restoredClasses,
          restoredSubjects,
          restoredStudents,
          restoredPayments,
        };
      },
      { maxWait: 15000, timeout: 35000 }
    );

    revalidatePath("/admin/backup");
    revalidatePath("/admin/students");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/grades");

    return {
      success: true,
      message: `تمت استعادة وتحديث البيانات بنجاح! (${result.restoredStudents} طالب، ${result.restoredClasses} صفوف، ${result.restoredSubjects} مواد، و ${result.restoredPayments} وصل مالي).`,
    };
  } catch (e: any) {
    return {
      success: false,
      error: "فشلت عملية الاستعادة: " + (e.message || "خطأ في بنية ملف النسخة الاحتياطية"),
    };
  }
}

export async function getEmergencyBundleData() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const [
    school,
    students,
    teachers,
    classRooms,
    sections,
    subjects,
    timetableSlots,
    gradeRecords,
    paymentReceipts,
    attendanceRecords,
    dailyReports,
    leaveRequests,
  ] = await Promise.all([
    // 1. Tenant info
    prisma.tenant.findUnique({ where: { id: tenantId } }),

    // 2. Students
    prisma.studentProfile.findMany({
      where: { tenantId },
      include: {
        user: true,
        classRoom: true,
        section: true,
        paymentReceipts: { orderBy: { createdAt: "desc" } },
        gradeRecords: { include: { subject: true }, orderBy: { subject: { orderIndex: "asc" } } },
        attendanceRecords: { orderBy: { date: "desc" }, take: 30 },
      },
      orderBy: [{ classRoom: { orderIndex: "asc" } }, { user: { fullName: "asc" } }],
    }),

    // 3. Teachers
    prisma.user.findMany({
      where: { tenantId, role: "TEACHER" },
      include: {
        teacherAssignments: {
          include: {
            classRoom: true,
            section: true,
            subject: true,
          },
        },
        teacherLeaves: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { fullName: "asc" },
    }),

    // 4. Classrooms
    prisma.classRoom.findMany({
      where: { tenantId },
      include: { sections: true },
      orderBy: { orderIndex: "asc" },
    }),

    // 5. Sections
    prisma.section.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    }),

    // 6. Subjects
    prisma.subject.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),

    // 7. Timetable
    prisma.timetableSlot.findMany({
      where: { tenantId },
      include: {
        classRoom: true,
        section: true,
        subject: true,
        teacher: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
    }),

    // 8. Grades
    prisma.gradeRecord.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
        subject: true,
      },
      orderBy: [{ student: { classRoom: { orderIndex: "asc" } } }, { subject: { orderIndex: "asc" } }],
    }),

    // 9. Financial Receipts
    prisma.paymentReceipt.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    // 10. Attendance
    prisma.attendanceRecord.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    }),

    // 11. Daily Reports
    prisma.dailyReport.findMany({
      where: { tenantId },
      include: {
        teacher: true,
        subject: true,
        classRoom: true,
        section: true,
      },
      orderBy: { date: "desc" },
    }),

    // 12. Leaves
    prisma.leaveRequest.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: true, classRoom: true, section: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    school,
    generatedAt: new Date().toLocaleString("ar-IQ"),
    generatedIso: new Date().toISOString(),
    students,
    teachers,
    classRooms,
    sections,
    subjects,
    timetableSlots,
    gradeRecords,
    paymentReceipts,
    attendanceRecords,
    dailyReports,
    leaveRequests,
  };
}
