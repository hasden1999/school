import { prisma } from "../src/lib/prisma";
import { registerStudentAction } from "../src/app/actions/studentActions";

async function testQuota() {
  console.log("=== TESTING STUDENT QUOTA ENFORCEMENT ===");

  // Find al-nukhba tenant
  const tenant = await prisma.tenant.findUnique({
    where: { code: "al-nukhba" },
  });
  if (!tenant) throw new Error("Tenant not found");

  const classRoom = await prisma.classRoom.findFirst({ where: { tenantId: tenant.id } });
  const section = await prisma.section.findFirst({ where: { classRoomId: classRoom?.id } });
  if (!classRoom || !section) throw new Error("Class or Section not found");

  // Temporarily set maxStudentsLimit to current active count
  const currentCount = await prisma.studentProfile.count({
    where: { tenantId: tenant.id, registrationStatus: "ACTIVE" },
  });

  const originalLimit = tenant.maxStudentsLimit;
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { maxStudentsLimit: currentCount },
  });

  console.log(`Configured tenant quota limit to exactly current count: ${currentCount}`);

  // Mock Admin session
  (global as any).__MOCK_SESSION__ = {
    id: "admin_user_id",
    tenantId: tenant.id,
    username: "admin",
    fullName: "مدير المدرسة",
    role: "ADMIN",
    mustChangePassword: false,
    schoolName: tenant.name,
  };

  // Try to register a new student beyond quota
  const res = await registerStudentAction({
    fullName: "طالب إضافي خارج السعة",
    guardianName: "ولي أمر تجريبي",
    guardianPhone: "07801112233",
    classRoomId: classRoom.id,
    sectionId: section.id,
    totalTuition: 1500000,
    depositAmount: 500000,
    paymentMethod: "CASH",
  });

  if (res.error && res.error.includes("الحد الأقصى لسعة الطلاب")) {
    console.log("✓ Quota enforced! Blocked student addition:", res.error);
  } else {
    console.error("✗ Quota was NOT enforced! Got:", res);
    process.exit(1);
  }

  // Restore original limit
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { maxStudentsLimit: originalLimit },
  });

  console.log("✓ Restored original tenant limit:", originalLimit);
  console.log("🎉 STUDENT QUOTA TEST PASSED WITH 100% SUCCESS!");
}

testQuota()
  .catch((e) => {
    console.error("Quota test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
