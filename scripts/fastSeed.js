const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function run() {
  console.log("Connecting to Neon PostgreSQL...");

  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { code: "al-nukhba" },
    update: {},
    create: {
      name: "ثانوية النخبة الأهلية للبنين",
      code: "al-nukhba",
      phone: "+9647701234567",
      address: "بغداد - الكرخ - حي الجامعة",
      currency: "د.ع",
      leaveCutoffTime: "08:00",
      attendanceAlertTime: "09:00",
      activeYear: "2024-2025",
    },
  });
  console.log("✓ Tenant ready:", tenant.name);
  const tenantId = tenant.id;

  const adminPass = "$2a$10$wN3t8gXFmKkP2qO5vU6ye.JzGk1q0zX7H7N9F4P2vR9o0zX7H7N9F"; // precomputed hash for quick seed
  const actualAdminPass = await bcrypt.hash("admin123", 6);
  const actualTeachPass = await bcrypt.hash("teach123", 6);
  const actualStuPass = await bcrypt.hash("stu123", 6);

  // 2. Admin User
  const admin = await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: "admin" } },
    update: { passwordHash: actualAdminPass },
    create: {
      tenantId,
      username: "admin",
      fullName: "أ. عادل التميمي (مدير المدرسة)",
      passwordHash: actualAdminPass,
      phone: "+9647701234567",
      role: "ADMIN",
      mustChangePassword: false,
    },
  });
  console.log("✓ Admin user ready: admin / admin123");

  // 3. Teachers
  const t1 = await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: "ahmed_math" } },
    update: { passwordHash: actualTeachPass },
    create: {
      tenantId,
      username: "ahmed_math",
      fullName: "أ. أحمد جاسم (مدرس الرياضيات)",
      passwordHash: actualTeachPass,
      phone: "+9647712345678",
      role: "TEACHER",
    },
  });
  console.log("✓ Teacher ready: ahmed_math / teach123");

  // 4. Classrooms & Sections
  const c1 = await prisma.classRoom.upsert({
    where: { tenantId_code: { tenantId, code: "1-INT" } },
    update: {},
    create: {
      tenantId,
      name: "الأول متوسط",
      code: "1-INT",
      annualTuition: 1500000,
      orderIndex: 1,
    },
  });

  const sec1A = await prisma.section.upsert({
    where: { tenantId_classRoomId_name: { tenantId, classRoomId: c1.id, name: "أ" } },
    update: {},
    create: {
      tenantId,
      classRoomId: c1.id,
      name: "أ",
    },
  });
  console.log("✓ Class & Section ready: الأول متوسط (أ)");

  // 5. Subject
  const subMath = await prisma.subject.upsert({
    where: { tenantId_code: { tenantId, code: "MATH-1" } },
    update: {},
    create: {
      tenantId,
      name: "الرياضيات",
      code: "MATH-1",
      orderIndex: 1,
    },
  });

  // Assign teacher
  await prisma.teacherAssignment.upsert({
    where: {
      tenantId_teacherId_classRoomId_sectionId_subjectId: {
        tenantId,
        teacherId: t1.id,
        classRoomId: c1.id,
        sectionId: sec1A.id,
        subjectId: subMath.id,
      },
    },
    update: {},
    create: {
      tenantId,
      teacherId: t1.id,
      classRoomId: c1.id,
      sectionId: sec1A.id,
      subjectId: subMath.id,
    },
  });
  console.log("✓ Subject & Assignment ready: الرياضيات");

  // 6. Student
  const stuUser = await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: "karrar2024" } },
    update: { passwordHash: actualStuPass },
    create: {
      tenantId,
      username: "karrar2024",
      fullName: "كرار حيدر علي",
      passwordHash: actualStuPass,
      phone: "+9647801122334",
      role: "STUDENT",
      mustChangePassword: false,
    },
  });

  const profile = await prisma.studentProfile.upsert({
    where: { userId: stuUser.id },
    update: {},
    create: {
      tenantId,
      userId: stuUser.id,
      studentNumber: "STU-2024-001",
      classRoomId: c1.id,
      sectionId: sec1A.id,
      guardianName: "حيدر علي عبد الحسين",
      guardianPhone: "+9647801122334",
      totalTuition: 1500000,
      depositAmount: 250000,
      registrationStatus: "ACTIVE",
    },
  });

  // 7. Initial Grade Record
  await prisma.gradeRecord.upsert({
    where: {
      tenantId_studentId_subjectId_academicYear: {
        tenantId,
        studentId: profile.id,
        subjectId: subMath.id,
        academicYear: "2024-2025",
      },
    },
    update: {},
    create: {
      tenantId,
      studentId: profile.id,
      classRoomId: c1.id,
      subjectId: subMath.id,
      academicYear: "2024-2025",
      month1: 88,
      month2: 92,
      term1Average: 90,
      midYear: 95,
      month3: 85,
      month4: 90,
      term2Average: 88,
      annualAverage: 89,
      finalExam: 92,
      finalGrade: 91,
    },
  });
  console.log("✓ Student & Grade record ready: كرار حيدر علي");

  console.log("🎉 NEON DATABASE FULLY POPULATED & READY FOR PRODUCTION!");
}

run()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
