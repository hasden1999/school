import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed for Iraqi School SaaS...");

  // 1. Create School Tenant
  const tenant = await prisma.tenant.upsert({
    where: { code: "al-nukhba" },
    update: {
      name: "مدرسة المعالي الأهلية الابتدائية المختلطة",
    },
    create: {
      name: "مدرسة المعالي الأهلية الابتدائية المختلطة",
      code: "al-nukhba",
      phone: "+9647701234567",
      address: "بغداد - الكرخ - حي الجامعة",
      currency: "د.ع",
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
    update: {},
    create: {
      tenantId,
      username: "admin",
      fullName: "أ. عادل التميمي (مدير المدرسة)",
      passwordHash: hashedAdminPass,
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
      fullName: "أ. أحمد جاسم (مدرس الرياضيات)",
      passwordHash: hashedTeachPass,
      phone: "+9647712345678",
      role: "TEACHER",
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: "t.ali" } },
    update: {},
    create: {
      tenantId,
      username: "t.ali",
      fullName: "أ. علي حسن (مدرس اللغة العربية)",
      passwordHash: hashedTeachPass,
      phone: "+9647723456789",
      role: "TEACHER",
    },
  });

  const teacher3 = await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: "t.mustafa" } },
    update: {},
    create: {
      tenantId,
      username: "t.mustafa",
      fullName: "أ. مصطفى سعد (مدرس العلوم والفيزياء)",
      passwordHash: hashedTeachPass,
      phone: "+9647734567890",
      role: "TEACHER",
    },
  });

  // 4. Create Classes and Sections
  const class1 = await prisma.classRoom.upsert({
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

  const class2 = await prisma.classRoom.upsert({
    where: { tenantId_code: { tenantId, code: "2-INT" } },
    update: {},
    create: {
      tenantId,
      name: "الثاني متوسط",
      code: "2-INT",
      annualTuition: 1600000,
      orderIndex: 2,
    },
  });

  const class3 = await prisma.classRoom.upsert({
    where: { tenantId_code: { tenantId, code: "3-INT" } },
    update: {},
    create: {
      tenantId,
      name: "الثالث متوسط (وزاري)",
      code: "3-INT",
      annualTuition: 1750000,
      orderIndex: 3,
    },
  });

  const class6 = await prisma.classRoom.upsert({
    where: { tenantId_code: { tenantId, code: "6-SCI" } },
    update: {},
    create: {
      tenantId,
      name: "السادس الإعدادي (العلمي)",
      code: "6-SCI",
      annualTuition: 2200000,
      orderIndex: 4,
    },
  });

  // Sections
  const sec1A = await prisma.section.upsert({
    where: { tenantId_classRoomId_name: { tenantId, classRoomId: class1.id, name: "أ" } },
    update: {},
    create: { tenantId, classRoomId: class1.id, name: "أ" },
  });

  const sec1B = await prisma.section.upsert({
    where: { tenantId_classRoomId_name: { tenantId, classRoomId: class1.id, name: "ب" } },
    update: {},
    create: { tenantId, classRoomId: class1.id, name: "ب" },
  });

  const sec2A = await prisma.section.upsert({
    where: { tenantId_classRoomId_name: { tenantId, classRoomId: class2.id, name: "أ" } },
    update: {},
    create: { tenantId, classRoomId: class2.id, name: "أ" },
  });

  const sec6A = await prisma.section.upsert({
    where: { tenantId_classRoomId_name: { tenantId, classRoomId: class6.id, name: "أ" } },
    update: {},
    create: { tenantId, classRoomId: class6.id, name: "أ" },
  });

  // 5. Subjects
  const subMath = await prisma.subject.upsert({
    where: { tenantId_code: { tenantId, code: "MATH" } },
    update: {},
    create: { tenantId, name: "الرياضيات", code: "MATH", orderIndex: 1 },
  });

  const subArabic = await prisma.subject.upsert({
    where: { tenantId_code: { tenantId, code: "ARABIC" } },
    update: {},
    create: { tenantId, name: "اللغة العربية", code: "ARABIC", orderIndex: 2 },
  });

  const subEnglish = await prisma.subject.upsert({
    where: { tenantId_code: { tenantId, code: "ENG" } },
    update: {},
    create: { tenantId, name: "اللغة الإنكليزية", code: "ENG", orderIndex: 3 },
  });

  const subPhysics = await prisma.subject.upsert({
    where: { tenantId_code: { tenantId, code: "PHYS" } },
    update: {},
    create: { tenantId, name: "الفيزياء والعلوم", code: "PHYS", orderIndex: 4 },
  });

  const subIslam = await prisma.subject.upsert({
    where: { tenantId_code: { tenantId, code: "ISLAM" } },
    update: {},
    create: { tenantId, name: "التربية الإسلامية", code: "ISLAM", orderIndex: 5 },
  });

  // 6. Teacher Assignments
  // Ahmed teaches Math for 1-INT A, 1-INT B, and 2-INT A
  await prisma.teacherAssignment.upsert({
    where: {
      tenantId_teacherId_classRoomId_sectionId_subjectId: {
        tenantId,
        teacherId: teacher1.id,
        classRoomId: class1.id,
        sectionId: sec1A.id,
        subjectId: subMath.id,
      },
    },
    update: {},
    create: {
      tenantId,
      teacherId: teacher1.id,
      classRoomId: class1.id,
      sectionId: sec1A.id,
      subjectId: subMath.id,
    },
  });

  await prisma.teacherAssignment.upsert({
    where: {
      tenantId_teacherId_classRoomId_sectionId_subjectId: {
        tenantId,
        teacherId: teacher1.id,
        classRoomId: class1.id,
        sectionId: sec1B.id,
        subjectId: subMath.id,
      },
    },
    update: {},
    create: {
      tenantId,
      teacherId: teacher1.id,
      classRoomId: class1.id,
      sectionId: sec1B.id,
      subjectId: subMath.id,
    },
  });

  // Ali teaches Arabic for 1-INT A and 1-INT B
  await prisma.teacherAssignment.upsert({
    where: {
      tenantId_teacherId_classRoomId_sectionId_subjectId: {
        tenantId,
        teacherId: teacher2.id,
        classRoomId: class1.id,
        sectionId: sec1A.id,
        subjectId: subArabic.id,
      },
    },
    update: {},
    create: {
      tenantId,
      teacherId: teacher2.id,
      classRoomId: class1.id,
      sectionId: sec1A.id,
      subjectId: subArabic.id,
    },
  });

  await prisma.teacherAssignment.upsert({
    where: {
      tenantId_teacherId_classRoomId_sectionId_subjectId: {
        tenantId,
        teacherId: teacher2.id,
        classRoomId: class1.id,
        sectionId: sec1B.id,
        subjectId: subArabic.id,
      },
    },
    update: {},
    create: {
      tenantId,
      teacherId: teacher2.id,
      classRoomId: class1.id,
      sectionId: sec1B.id,
      subjectId: subArabic.id,
    },
  });

  // Mustafa teaches Physics for 1-INT A and 2-INT A
  await prisma.teacherAssignment.upsert({
    where: {
      tenantId_teacherId_classRoomId_sectionId_subjectId: {
        tenantId,
        teacherId: teacher3.id,
        classRoomId: class1.id,
        sectionId: sec1A.id,
        subjectId: subPhysics.id,
      },
    },
    update: {},
    create: {
      tenantId,
      teacherId: teacher3.id,
      classRoomId: class1.id,
      sectionId: sec1A.id,
      subjectId: subPhysics.id,
    },
  });

  // 7. Timetable Slots (Period 1 logic rules)
  // For 1-INT A on SUNDAY: Period 1 = Ahmed (Math)
  // For 1-INT B on SUNDAY: Period 1 = Ali (Arabic)
  // For 2-INT A on SUNDAY: Period 1 = Mustafa (Physics)
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];

  for (const day of days) {
    // 1-INT A
    await prisma.timetableSlot.upsert({
      where: {
        tenantId_classRoomId_sectionId_dayOfWeek_periodNumber: {
          tenantId,
          classRoomId: class1.id,
          sectionId: sec1A.id,
          dayOfWeek: day,
          periodNumber: 1,
        },
      },
      update: {},
      create: {
        tenantId,
        classRoomId: class1.id,
        sectionId: sec1A.id,
        dayOfWeek: day,
        periodNumber: 1,
        teacherId: teacher1.id, // Ahmed
        subjectId: subMath.id,
      },
    });

    await prisma.timetableSlot.upsert({
      where: {
        tenantId_classRoomId_sectionId_dayOfWeek_periodNumber: {
          tenantId,
          classRoomId: class1.id,
          sectionId: sec1A.id,
          dayOfWeek: day,
          periodNumber: 2,
        },
      },
      update: {},
      create: {
        tenantId,
        classRoomId: class1.id,
        sectionId: sec1A.id,
        dayOfWeek: day,
        periodNumber: 2,
        teacherId: teacher2.id, // Ali
        subjectId: subArabic.id,
      },
    });

    // 1-INT B
    await prisma.timetableSlot.upsert({
      where: {
        tenantId_classRoomId_sectionId_dayOfWeek_periodNumber: {
          tenantId,
          classRoomId: class1.id,
          sectionId: sec1B.id,
          dayOfWeek: day,
          periodNumber: 1,
        },
      },
      update: {},
      create: {
        tenantId,
        classRoomId: class1.id,
        sectionId: sec1B.id,
        dayOfWeek: day,
        periodNumber: 1,
        teacherId: teacher2.id, // Ali
        subjectId: subArabic.id,
      },
    });
  }

  // 8. Document Requirements
  const docReqs = [
    { title: "هوية الأحوال المدنية / البطاقة الموحدة للطالب", isRequired: true },
    { title: "بطاقة السكن أو تأييد السكن المعتمد", isRequired: true },
    { title: "صور شخصية حديثة (عدد 4 خلفية بيضاء)", isRequired: true },
    { title: "وثيقة أو كشف درجات السنة السابقة", isRequired: true },
    { title: "استمارة الفحص الطبي المعتمدة", isRequired: false },
  ];

  const createdDocReqs = [];
  for (const doc of docReqs) {
    const r = await prisma.documentRequirement.create({
      data: {
        tenantId,
        title: doc.title,
        isRequired: doc.isRequired,
      },
    });
    createdDocReqs.push(r);
  }

  // 9. Students
  const studentsData = [
    {
      username: "s.karrar",
      fullName: "كرار حيدر جاسم",
      studentNumber: "STU-2025-001",
      guardianName: "حيدر جاسم الموسوي",
      guardianPhone: "+9647709876541",
      classId: class1.id,
      secId: sec1A.id,
      tuition: 1500000,
      deposit: 300000,
      grades: [
        { subjectId: subMath.id, m1: 88, m2: 92, mid: 85, m3: 90, m4: 94, fin: 91 },
        { subjectId: subArabic.id, m1: 75, m2: 80, mid: 78, m3: 82, m4: 85, fin: 84 },
        { subjectId: subPhysics.id, m1: 95, m2: 90, mid: 92, m3: 88, m4: 96, fin: 94 },
      ],
    },
    {
      username: "s.hassan",
      fullName: "حسن علي رحيم",
      studentNumber: "STU-2025-002",
      guardianName: "علي رحيم العامري",
      guardianPhone: "+9647709876542",
      classId: class1.id,
      secId: sec1A.id,
      tuition: 1500000,
      deposit: 250000,
      grades: [
        { subjectId: subMath.id, m1: 65, m2: 70, mid: 68, m3: 72, m4: 75, fin: 70 },
        { subjectId: subArabic.id, m1: 88, m2: 84, mid: 86, m3: 90, m4: 92, fin: 89 },
      ],
    },
    {
      username: "s.abbas",
      fullName: "عباس عادل عبد الله",
      studentNumber: "STU-2025-003",
      guardianName: "عادل عبد الله الساعدي",
      guardianPhone: "+9647709876543",
      classId: class1.id,
      secId: sec1B.id,
      tuition: 1500000,
      deposit: 500000,
      grades: [
        { subjectId: subMath.id, m1: 92, m2: 95, mid: 90, m3: 94, m4: 98, fin: 96 },
        { subjectId: subArabic.id, m1: 90, m2: 88, mid: 92, m3: 85, m4: 91, fin: 90 },
      ],
    },
    {
      username: "s.mustafa",
      fullName: "مصطفى رائد كاظم",
      studentNumber: "STU-2025-004",
      guardianName: "رائد كاظم الجبوري",
      guardianPhone: "+9647709876544",
      classId: class2.id,
      secId: sec2A.id,
      tuition: 1600000,
      deposit: 400000,
      grades: [
        { subjectId: subMath.id, m1: 78, m2: 82, mid: 80, m3: 84, m4: 86, fin: 85 },
      ],
    },
    {
      username: "s.youssef",
      fullName: "يوسف عمار شاكر",
      studentNumber: "STU-2025-005",
      guardianName: "عمار شاكر المهداوي",
      guardianPhone: "+9647709876545",
      classId: class6.id,
      secId: sec6A.id,
      tuition: 2200000,
      deposit: 600000,
      grades: [
        { subjectId: subPhysics.id, m1: 98, m2: 96, mid: 97, m3: 99, m4: 100, fin: 99 },
      ],
    },
  ];

  await prisma.gradeRecord.deleteMany({ where: { tenantId } });
  await prisma.studentDocument.deleteMany({ where: { tenantId } });
  await prisma.paymentReceipt.deleteMany({ where: { tenantId } });

  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { tenantId_username: { tenantId, username: s.username } },
      update: {},
      create: {
        tenantId,
        username: s.username,
        fullName: s.fullName,
        passwordHash: hashedStuPass,
        role: "STUDENT",
        phone: s.guardianPhone,
      },
    });

    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        tenantId,
        userId: user.id,
        studentNumber: s.studentNumber,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        classRoomId: s.classId,
        sectionId: s.secId,
        totalTuition: s.tuition,
        depositAmount: s.deposit,
        registrationStatus: "ACTIVE",
      },
    });

    // Create Payment Receipts
    await prisma.paymentReceipt.upsert({
      where: { tenantId_receiptNumber: { tenantId, receiptNumber: "REC-2024-0001" } },
      update: {},
      create: {
        tenantId,
        studentId: profile.id,
        receiptNumber: "REC-2024-0001",
        amount: 250000,
        paymentDate: "2024-09-01",
        paymentMethod: "CASH",
        notes: "عربون التسجيل المبدئي وحجز المقعد الدراسي",
        receivedByUserId: admin.id,
      },
    });

    await prisma.paymentReceipt.upsert({
      where: { tenantId_receiptNumber: { tenantId, receiptNumber: "REC-2024-0104" } },
      update: {},
      create: {
        tenantId,
        studentId: profile.id,
        receiptNumber: "REC-2024-0104",
        amount: 500000,
        paymentDate: "2024-10-15",
        paymentMethod: "ZAIN_CASH",
        notes: "الدفعة الأولى من القسط الدراسي للعام 2024-2025",
        receivedByUserId: admin.id,
      },
    });

    // Document status
    for (let i = 0; i < createdDocReqs.length; i++) {
      const isMissing = s.username === "s.mustafa" && i >= 2;
      await prisma.studentDocument.create({
        data: {
          tenantId,
          studentId: profile.id,
          documentReqId: createdDocReqs[i].id,
          status: isMissing ? "MISSING" : "VERIFIED",
          fileUrl: isMissing ? null : "/uploads/sample_doc.jpg",
        },
      });
    }

    // Grade Records with calculated fields
    for (const g of s.grades) {
      const term1Avg = (g.m1 + g.m2) / 2;
      const term2Avg = (g.m3 + g.m4) / 2;
      const annualAvg = (term1Avg + term2Avg + g.mid) / 3;
      const finGrade = (annualAvg + g.fin) / 2;

      await prisma.gradeRecord.create({
        data: {
          tenantId,
          studentId: profile.id,
          subjectId: g.subjectId,
          classRoomId: s.classId,
          academicYear: "2024-2025",
          month1: g.m1,
          month2: g.m2,
          term1Average: Math.round(term1Avg * 10) / 10,
          midYear: g.mid,
          month3: g.m3,
          month4: g.m4,
          term2Average: Math.round(term2Avg * 10) / 10,
          annualAverage: Math.round(annualAvg * 10) / 10,
          finalExam: g.fin,
          finalGrade: Math.round(finGrade * 10) / 10,
          isMonth1Locked: true,
          isMonth2Locked: true,
          isMidYearLocked: true,
          isMonth3Locked: true,
          isMonth4Locked: true,
          isFinalExamLocked: true,
          isFullyApproved: true,
        },
      });
    }
  }

  // 10. Sample Daily Reports
  await prisma.dailyReport.deleteMany({ where: { tenantId } });
  await prisma.dailyReport.create({
    data: {
      tenantId,
      teacherId: teacher1.id,
      classRoomId: class1.id,
      sectionId: sec1A.id,
      subjectId: subMath.id,
      date: new Date().toISOString().split("T")[0],
      title: "حل معادلات الدرجة الأولى بمتغير واحد",
      content: "تم شرح حل المعادلات وتطبيقاتها على الأعداد الصحيحة مع حل الأمثلة 1 و 2 من صفحة 45.",
      homework: "حل تمارين (تأكد من فهمك) رقم 1 إلى 5 صفحة 48 في دفتر الواجبات.",
      status: "APPROVED",
      approvedByAdminId: admin.id,
      approvedAt: new Date(),
    },
  });

  await prisma.dailyReport.create({
    data: {
      tenantId,
      teacherId: teacher2.id,
      classRoomId: class1.id,
      sectionId: sec1A.id,
      subjectId: subArabic.id,
      date: new Date().toISOString().split("T")[0],
      title: "قواعد اللغة: علامات الإعراب الأصلية والفرعية",
      content: "تم إكمال شرح علامات رفع ونصب المبتدأ والخبر وكيفية التمييز بينها.",
      homework: "كتابة وحل تمرين رقم 3 صفحة 30.",
      status: "PENDING_APPROVAL",
    },
  });

  // 11. Teacher Evaluation Exam (COMPLETELY ISOLATED)
  await prisma.teacherEvaluationExam.deleteMany({ where: { tenantId } });
  await prisma.teacherEvaluationExam.create({
    data: {
      tenantId,
      title: "استبيان تقييم أداء مدرس مادة الرياضيات للفصل الأول",
      description: "يرجى الإجابة بدقة وموضوعية لمساعدتنا في تطوير الكفاءة التدريسية. التقييم سري بالكامل ومتاح للمدير فقط.",
      targetTeacherId: teacher1.id,
      classRoomId: class1.id,
      sectionId: sec1A.id,
      subjectId: subMath.id,
      questionsJson: JSON.stringify([
        { id: "q1", type: "rating", text: "مدى وضوح شرح الأستاذ للمفاهيم الرياضية المعقدة (من 1 إلى 5)" },
        { id: "q2", type: "rating", text: "التزام الأستاذ بمواعيد الحصة واستثمار وقت الدرس كاملاً" },
        { id: "q3", type: "rating", text: "حرص الأستاذ على الإجابة عن أسئلة الطلاب ومساعدتهم" },
        { id: "q4", type: "text", text: "ما هي المقترحات التي توجهها لتحسين أسلوب التدريس في هذه المادة؟" },
      ]),
      isActive: true,
      createdByAdminId: admin.id,
    },
  });

  // 12. Demo Teacher Leave (for substitute alert demonstration)
  await prisma.teacherLeave.deleteMany({ where: { tenantId } });
  await prisma.teacherLeave.create({
    data: {
      tenantId,
      teacherId: teacher1.id,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      reason: "إجازة صحية طارئة",
      status: "APPROVED",
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
