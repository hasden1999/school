import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed for Al-Maali Primary School (Offline-First SQLite)...");

  // 1. Create or Update School Tenant
  const tenant = await prisma.tenant.upsert({
    where: { code: "al-nukhba" },
    update: {
      name: "مدرسة المعالي الأهلية الابتدائية المختلطة",
      schoolType: "ابتدائية مختلطة",
      directorName: "أ. عادل التميمي",
    },
    create: {
      name: "مدرسة المعالي الأهلية الابتدائية المختلطة",
      code: "al-nukhba",
      phone: "+9647701234567",
      address: "بغداد - الكرخ - حي الجامعة",
      currency: "د.ع",
      schoolType: "ابتدائية مختلطة",
      directorName: "أ. عادل التميمي",
      leaveCutoffTime: "08:00",
      attendanceAlertTime: "09:00",
      activeYear: "2024-2025",
    },
  });

  const tenantId = tenant.id;
  const hashedAdminPass = await bcrypt.hash("admin123", 10);
  const hashedTeachPass = await bcrypt.hash("teach123", 10);
  const hashedStuPass = await bcrypt.hash("stu123", 10);

  // 2. Create Admin User
  const admin = await prisma.user.upsert({
    where: {
      tenantId_username: {
        tenantId,
        username: "admin",
      },
    },
    update: {
      passwordHash: hashedAdminPass,
      plainPasscode: "admin",
    },
    create: {
      tenantId,
      username: "admin",
      fullName: "أ. عادل التميمي (مدير المدرسة)",
      passwordHash: hashedAdminPass,
      plainPasscode: "admin",
      phone: "+9647701234567",
      role: "ADMIN",
      mustChangePassword: false,
    },
  });

  // 3. Create Teachers
  const teacher1 = await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: "t.ahmed" } },
    update: {},
    create: {
      tenantId,
      username: "t.ahmed",
      fullName: "أ. أحمد جاسم (معلم الرياضيات)",
      passwordHash: hashedTeachPass,
      plainPasscode: "teach",
      phone: "+9647712345678",
      role: "TEACHER",
      monthlySalary: 750000,
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: "t.ali" } },
    update: {},
    create: {
      tenantId,
      username: "t.ali",
      fullName: "ست مريم خليل (معلمة القراءة واللغة العربية)",
      passwordHash: hashedTeachPass,
      plainPasscode: "teach",
      phone: "+9647723456789",
      role: "TEACHER",
      monthlySalary: 700000,
    },
  });

  const teacher3 = await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: "t.mustafa" } },
    update: {},
    create: {
      tenantId,
      username: "t.mustafa",
      fullName: "أ. مصطفى سعد (معلم العلوم والإنكليزي)",
      passwordHash: hashedTeachPass,
      plainPasscode: "teach",
      phone: "+9647734567890",
      role: "TEACHER",
      monthlySalary: 800000,
    },
  });

  // 4. Create 6 Primary Classes
  const classNames = [
    { name: "الأول الابتدائي", code: "1-PRI", tuition: 1200000, order: 1 },
    { name: "الثاني الابتدائي", code: "2-PRI", tuition: 1200000, order: 2 },
    { name: "الثالث الابتدائي", code: "3-PRI", tuition: 1300000, order: 3 },
    { name: "الرابع الابتدائي", code: "4-PRI", tuition: 1300000, order: 4 },
    { name: "الخامس الابتدائي", code: "5-PRI", tuition: 1400000, order: 5 },
    { name: "السادس الابتدائي (الوزاري)", code: "6-PRI", tuition: 1500000, order: 6, isGrad: true },
  ];

  const createdClasses: any[] = [];
  for (const c of classNames) {
    const cls = await prisma.classRoom.upsert({
      where: { tenantId_code: { tenantId, code: c.code } },
      update: { name: c.name, annualTuition: c.tuition, orderIndex: c.order },
      create: {
        tenantId,
        name: c.name,
        code: c.code,
        annualTuition: c.tuition,
        orderIndex: c.order,
        isGraduatingClass: !!c.isGrad,
      },
    });
    createdClasses.push(cls);
  }

  // Sections for each class (أ and ب)
  const createdSections: any[] = [];
  for (const cls of createdClasses) {
    for (const sName of ["أ", "ب"]) {
      const sec = await prisma.section.upsert({
        where: { tenantId_classRoomId_name: { tenantId, classRoomId: cls.id, name: sName } },
        update: {},
        create: {
          tenantId,
          classRoomId: cls.id,
          name: sName,
        },
      });
      createdSections.push(sec);
    }
  }

  // 5. Create Primary Subjects
  const subjectList = [
    { name: "التربية الإسلامية والقرآن", code: "ISLAM", order: 1 },
    { name: "القراءة واللغة العربية", code: "ARABIC", order: 2 },
    { name: "الرياضيات والحساب", code: "MATH", order: 3 },
    { name: "العلوم والحياة", code: "SCIENCE", order: 4 },
    { name: "اللغة الإنكليزية", code: "ENGLISH", order: 5 },
    { name: "الاجتماعيات والوطنية", code: "SOCIAL", order: 6 },
    { name: "التربية الفنية والنشيد", code: "ART", order: 7 },
    { name: "التربية الرياضية والصحية", code: "SPORT", order: 8 },
  ];

  const createdSubjects: any[] = [];
  for (const s of subjectList) {
    const sub = await prisma.subject.upsert({
      where: { tenantId_code: { tenantId, code: s.code } },
      update: { name: s.name, orderIndex: s.order },
      create: {
        tenantId,
        name: s.name,
        code: s.code,
        orderIndex: s.order,
      },
    });
    createdSubjects.push(sub);
  }

  // 6. Teacher Assignments
  const c1 = createdClasses[0]; // 1-PRI
  const c2 = createdClasses[1]; // 2-PRI
  const sA1 = createdSections.find((s) => s.classRoomId === c1.id && s.name === "أ")!;
  const sA2 = createdSections.find((s) => s.classRoomId === c2.id && s.name === "أ")!;

  const subMath = createdSubjects.find((s) => s.code === "MATH")!;
  const subArabic = createdSubjects.find((s) => s.code === "ARABIC")!;
  const subScience = createdSubjects.find((s) => s.code === "SCIENCE")!;

  await prisma.teacherAssignment.upsert({
    where: {
      tenantId_teacherId_classRoomId_sectionId_subjectId: {
        tenantId,
        teacherId: teacher1.id,
        classRoomId: c1.id,
        sectionId: sA1.id,
        subjectId: subMath.id,
      },
    },
    update: {},
    create: {
      tenantId,
      teacherId: teacher1.id,
      classRoomId: c1.id,
      sectionId: sA1.id,
      subjectId: subMath.id,
    },
  });

  await prisma.teacherAssignment.upsert({
    where: {
      tenantId_teacherId_classRoomId_sectionId_subjectId: {
        tenantId,
        teacherId: teacher2.id,
        classRoomId: c1.id,
        sectionId: sA1.id,
        subjectId: subArabic.id,
      },
    },
    update: {},
    create: {
      tenantId,
      teacherId: teacher2.id,
      classRoomId: c1.id,
      sectionId: sA1.id,
      subjectId: subArabic.id,
    },
  });

  // 7. Create Sample Students
  const sampleStudents = [
    { name: "كرار حيدر جاسم الموسوي", user: "s.karrar", pass: "skarr", num: "STU-2025-001", guardian: "حيدر جاسم الموسوي", phone: "+9647709876541", deposit: 300000, cls: c1, sec: sA1 },
    { name: "حسن علي رحيم الخفاجي", user: "s.hassan", pass: "shass", num: "STU-2025-002", guardian: "علي رحيم الخفاجي", phone: "+9647709876542", deposit: 400000, cls: c1, sec: sA1 },
    { name: "عباس عادل عبد الله الساعدي", user: "s.abbas", pass: "sabba", num: "STU-2025-003", guardian: "عادل عبد الله الساعدي", phone: "+9647709876543", deposit: 250000, cls: c1, sec: sA1 },
    { name: "مصطفى رائد كاظم العامري", user: "s.mustafa", pass: "smust", num: "STU-2025-004", guardian: "رائد كاظم العامري", phone: "+9647709876544", deposit: 300000, cls: c2, sec: sA2 },
    { name: "يوسف عمار حسين البصري", user: "s.youssef", pass: "syous", num: "STU-2025-005", guardian: "عمار حسين البصري", phone: "+9647709876545", deposit: 500000, cls: c2, sec: sA2 },
  ];

  for (const s of sampleStudents) {
    const sUser = await prisma.user.upsert({
      where: { tenantId_username: { tenantId, username: s.user } },
      update: { fullName: s.name, plainPasscode: s.pass },
      create: {
        tenantId,
        username: s.user,
        fullName: s.name,
        passwordHash: hashedStuPass,
        plainPasscode: s.pass,
        role: "STUDENT",
        phone: s.phone,
      },
    });

    const sProfile = await prisma.studentProfile.upsert({
      where: { tenantId_studentNumber: { tenantId, studentNumber: s.num } },
      update: {
        classRoomId: s.cls.id,
        sectionId: s.sec.id,
        guardianName: s.guardian,
        guardianPhone: s.phone,
        totalTuition: s.cls.annualTuition,
        depositAmount: s.deposit,
      },
      create: {
        tenantId,
        userId: sUser.id,
        studentNumber: s.num,
        classRoomId: s.cls.id,
        sectionId: s.sec.id,
        guardianName: s.guardian,
        guardianPhone: s.phone,
        totalTuition: s.cls.annualTuition,
        depositAmount: s.deposit,
        registrationStatus: "ACTIVE",
      },
    });

    // Seed sample grades for each subject
    for (const sub of createdSubjects) {
      await prisma.gradeRecord.upsert({
        where: {
          tenantId_studentId_subjectId_academicYear: {
            tenantId,
            studentId: sProfile.id,
            subjectId: sub.id,
            academicYear: "2024-2025",
          },
        },
        update: {},
        create: {
          tenantId,
          studentId: sProfile.id,
          subjectId: sub.id,
          classRoomId: s.cls.id,
          academicYear: "2024-2025",
          month1: 88,
          month2: 92,
          midYear: 90,
          month3: 95,
          month4: 93,
          finalExam: 94,
        },
      });
    }

    // Seed sample receipt
    if (s.deposit > 0) {
      await prisma.paymentReceipt.create({
        data: {
          tenantId,
          studentId: sProfile.id,
          receiptNumber: `REC-2025-${s.num.slice(-3)}`,
          amount: s.deposit,
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod: "CASH",
          notes: "عربون تثبيت المقعد والتسجيل الابتدائي",
          receivedByUserId: admin.id,
        },
      });
    }
  }

  // 8. Timetable Slots
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
  for (const d of days) {
    await prisma.timetableSlot.upsert({
      where: {
        tenantId_classRoomId_sectionId_dayOfWeek_periodNumber: {
          tenantId,
          classRoomId: c1.id,
          sectionId: sA1.id,
          dayOfWeek: d,
          periodNumber: 1,
        },
      },
      update: {},
      create: {
        tenantId,
        classRoomId: c1.id,
        sectionId: sA1.id,
        dayOfWeek: d,
        periodNumber: 1,
        teacherId: teacher1.id,
        subjectId: subMath.id,
      },
    });

    await prisma.timetableSlot.upsert({
      where: {
        tenantId_classRoomId_sectionId_dayOfWeek_periodNumber: {
          tenantId,
          classRoomId: c1.id,
          sectionId: sA1.id,
          dayOfWeek: d,
          periodNumber: 2,
        },
      },
      update: {},
      create: {
        tenantId,
        classRoomId: c1.id,
        sectionId: sA1.id,
        dayOfWeek: d,
        periodNumber: 2,
        teacherId: teacher2.id,
        subjectId: subArabic.id,
      },
    });
  }

  console.log("✅ Seed completed successfully for Al-Maali Primary School!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
