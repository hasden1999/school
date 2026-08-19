"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
  processedIds: string[];
}

/**
 * Fetch full school bundle for offline caching in IndexedDB
 */
export async function fetchSchoolOfflineBundleAction() {
  const session = await getSession();
  if (!session) {
    throw new Error("غير مصرح لك بتنزيل بيانات المدرسة");
  }

  const [tenant, classRooms, sections, subjects, students, teachers] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: {
        id: true,
        name: true,
        schoolType: true,
        currency: true,
        logo: true,
        stampUrl: true,
        activeYear: true,
      },
    }),
    prisma.classRoom.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, code: true, orderIndex: true },
    }),
    prisma.section.findMany({
      where: { classRoom: { tenantId: session.tenantId } },
      select: { id: true, name: true, classRoomId: true },
    }),
    prisma.subject.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, code: true, orderIndex: true },
    }),
    prisma.studentProfile.findMany({
      where: { tenantId: session.tenantId, registrationStatus: "ACTIVE" },
      include: {
        user: { select: { fullName: true, username: true } },
        classRoom: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        gradeRecords: true,
        paymentReceipts: true,
      },
    }),
    prisma.user.findMany({
      where: { tenantId: session.tenantId, role: "TEACHER" },
      select: {
        id: true,
        fullName: true,
        username: true,
        phone: true,
        role: true,
        teacherAssignments: {
          include: {
            classRoom: { select: { name: true } },
            subject: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return {
    success: true,
    bundle: {
      tenantId: session.tenantId,
      schoolName: tenant?.name || "المدرسة",
      schoolType: tenant?.schoolType || "ابتدائية",
      currency: tenant?.currency || "د.ع",
      classRooms,
      sections,
      subjects,
      students,
      teachers,
      lastCachedAt: new Date().toISOString(),
    },
  };
}

/**
 * Process a batch of pending offline operations (Student creation, Attendance, Grades, Payments)
 * Ensures Multi-Tenant Isolation & Idempotency
 */
export async function syncOfflineBatchAction(items: any[]): Promise<SyncResult> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      syncedCount: 0,
      failedCount: items.length,
      errors: ["جلسة المستخدم منتهية الصلاحية"],
      processedIds: [],
    };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  const processedIds: string[] = [];

  for (const item of items) {
    const opKey = item.operationId || item.id;
    try {
      const type = item.entity || item.type;
      const payload = item.payload || item;

      // 1. STUDENT REGISTRATION SYNC
      if (type === "STUDENT") {
        const {
          fullName,
          guardianName,
          guardianPhone,
          classRoomId,
          sectionId,
          totalTuition,
          depositAmount,
          paymentMethod,
          depositNotes,
        } = payload;

        // Check if student with this guardian phone & name already created (Idempotency)
        const existingStudent = await prisma.studentProfile.findFirst({
          where: {
            tenantId: session.tenantId,
            guardianPhone,
            guardianName,
            user: { fullName },
          },
        });

        if (!existingStudent) {
          const rawUsername = `stu_${Date.now().toString().slice(-4)}_${Math.random().toString(36).substring(2, 5)}`;
          const count = await prisma.studentProfile.count({ where: { tenantId: session.tenantId } });
          const studentNumber = `STU-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

          const user = await prisma.user.create({
            data: {
              tenantId: session.tenantId,
              username: rawUsername,
              fullName,
              passwordHash: "OFFLINE_TEMP_PASS",
              role: "STUDENT",
              phone: guardianPhone,
            },
          });

          await prisma.studentProfile.create({
            data: {
              tenantId: session.tenantId,
              userId: user.id,
              classRoomId,
              sectionId,
              studentNumber,
              guardianName,
              guardianPhone,
              totalTuition: Number(totalTuition) || 1500000,
              depositAmount: Number(depositAmount) || 0,
              registrationStatus: "ACTIVE",
            },
          });
        }
      }
      // 2. ATTENDANCE SYNC
      else if (type === "ATTENDANCE") {
        const { classRoomId, sectionId, dateStr, records } = payload;

        for (const rec of records || []) {
          const existing = await prisma.attendanceRecord.findFirst({
            where: {
              tenantId: session.tenantId,
              studentId: rec.studentId,
              date: dateStr,
              periodNumber: 1,
            },
          });

          if (existing) {
            await prisma.attendanceRecord.update({
              where: { id: existing.id },
              data: {
                status: rec.status,
                notes: rec.notes || null,
              },
            });
          } else {
            await prisma.attendanceRecord.create({
              data: {
                tenantId: session.tenantId,
                studentId: rec.studentId,
                classRoomId: classRoomId || "default",
                sectionId: sectionId || "default",
                date: dateStr,
                periodNumber: 1,
                recordedByUserId: session.id,
                status: rec.status,
                notes: rec.notes || null,
              },
            });
          }
        }
      }
      // 3. GRADE SYNC
      else if (type === "GRADE") {
        const { classRoomId, subjectId, phase, items: gradeItems } = payload;

        for (const g of gradeItems || []) {
          const existing = await prisma.gradeRecord.findFirst({
            where: {
              tenantId: session.tenantId,
              studentId: g.studentId,
              subjectId,
            },
          });

          const updateData: any = { [phase]: g.score };

          if (existing) {
            const m1 = phase === "month1" ? g.score : existing.month1;
            const m2 = phase === "month2" ? g.score : existing.month2;
            let term1Avg = existing.term1Average;
            if (m1 !== null && m2 !== null) {
              term1Avg = Math.round(((m1 + m2) / 2) * 10) / 10;
            }

            const m3 = phase === "month3" ? g.score : existing.month3;
            const m4 = phase === "month4" ? g.score : existing.month4;
            let term2Avg = existing.term2Average;
            if (m3 !== null && m4 !== null) {
              term2Avg = Math.round(((m3 + m4) / 2) * 10) / 10;
            }

            const mid = phase === "midYear" ? g.score : existing.midYear;
            let annualAvg = existing.annualAverage;
            if (term1Avg !== null && term2Avg !== null && mid !== null) {
              annualAvg = Math.round(((term1Avg + term2Avg + mid) / 3) * 10) / 10;
            }

            const finalExam = phase === "finalExam" ? g.score : existing.finalExam;
            let finalGrade = existing.finalGrade;
            if (annualAvg !== null && finalExam !== null) {
              finalGrade = Math.round(((annualAvg + finalExam) / 2) * 10) / 10;
            }

            await prisma.gradeRecord.update({
              where: { id: existing.id },
              data: {
                ...updateData,
                term1Average: term1Avg,
                term2Average: term2Avg,
                annualAverage: annualAvg,
                finalGrade,
              },
            });
          } else {
            let resolvedClassId = classRoomId;
            if (!resolvedClassId) {
              const stu = await prisma.studentProfile.findUnique({
                where: { id: g.studentId },
                select: { classRoomId: true },
              });
              resolvedClassId = stu?.classRoomId || "default";
            }

            await prisma.gradeRecord.create({
              data: {
                tenantId: session.tenantId,
                studentId: g.studentId,
                subjectId,
                classRoomId: resolvedClassId,
                ...updateData,
              },
            });
          }
        }
      }
      // 4. PAYMENT SYNC
      else if (type === "PAYMENT") {
        const { studentId, amount, paymentMethod, notes, receiptNumber, paymentDate } = payload;
        const finalReceiptNumber = receiptNumber || `RCP-OFF-${Date.now().toString().slice(-6)}`;

        const existingReceipt = await prisma.paymentReceipt.findFirst({
          where: {
            tenantId: session.tenantId,
            receiptNumber: finalReceiptNumber,
          },
        });

        if (!existingReceipt) {
          await prisma.paymentReceipt.create({
            data: {
              tenantId: session.tenantId,
              studentId,
              receiptNumber: finalReceiptNumber,
              amount: Number(amount),
              paymentDate: paymentDate || new Date().toISOString().split("T")[0],
              paymentMethod: paymentMethod || "CASH",
              receivedByUserId: session.id,
              notes: notes ? `${notes} (تمت المزامنة أوفلاين)` : "تم القبض أوفلاين والمزامنة لاحقاً",
            },
          });
        }
      }

      syncedCount++;
      processedIds.push(opKey);
    } catch (e: any) {
      failedCount++;
      errors.push(`فشل عملية ${opKey}: ${e.message || "خطأ غير معروف"}`);
    }
  }

  // Revalidate admin cache paths
  revalidatePath("/admin/students");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/dashboard");

  return {
    success: failedCount === 0,
    syncedCount,
    failedCount,
    errors,
    processedIds,
  };
}
