import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { code: "al-nukhba" } });
  if (!tenant) return;

  const users = await prisma.user.findMany({ where: { tenantId: tenant.id } });

  const admin = users.find((u) => u.role === "ADMIN");
  const teacher = users.find((u) => u.username === "t.ahmed");
  const student = users.find((u) => u.username === "s.karrar");

  if (admin) {
    await prisma.notification.createMany({
      data: [
        {
          tenantId: tenant.id,
          userId: admin.id,
          title: "تقرير وواجب مدرسي جديد 📚",
          message: "قام الأستاذ (أحمد جاسم) برفع تقرير يومي وواجب لمادة الرياضيات للصف السادس العلمي (شعبة أ) بانتظار الاعتماد.",
          type: "REPORT",
          link: "/admin/reports",
          isRead: false,
        },
        {
          tenantId: tenant.id,
          userId: admin.id,
          title: "طلب إجازة طالب جديد 🗓️",
          message: "قدم الطالب (كرار حيدر) طلب إجازة رسمية لسبب مرضي مع إرفاق التقرير الطبي.",
          type: "LEAVE",
          link: "/admin/leaves",
          isRead: false,
        },
        {
          tenantId: tenant.id,
          userId: admin.id,
          title: "تسجيل دفعة قسط دراسي 💳",
          message: "تم بنجاح تحصيل دفعة بقيمة 250,000 د.ع من الطالب (يوسف عمار) وإصدار وصل استلام رسمي.",
          type: "PAYMENT",
          link: "/admin/payments",
          isRead: true,
        },
      ],
    });
  }

  if (teacher) {
    await prisma.notification.createMany({
      data: [
        {
          tenantId: tenant.id,
          userId: teacher.id,
          title: "تم اعتماد تقريرك اليومي بنجاح ✅",
          message: "اعتمدت الإدارة تقرير وواجب مادة الرياضيات للصف السادس العلمي - شعبة (أ) ونُشر للطلاب.",
          type: "REPORT",
          link: "/teacher/reports",
          isRead: false,
        },
        {
          tenantId: tenant.id,
          userId: teacher.id,
          title: "تذكير رصد الحضور الصباحي ⏰",
          message: "يرجى رصد واعتماد كشف الحضور والغياب للحصة الأولى للصف المخصص قبل الساعة 9:00 صباحاً.",
          type: "ATTENDANCE",
          link: "/teacher/attendance",
          isRead: false,
        },
      ],
    });
  }

  if (student) {
    await prisma.notification.createMany({
      data: [
        {
          tenantId: tenant.id,
          userId: student.id,
          title: "تقرير وواجب مدرسي جديد 📚",
          message: "نشر أ. أحمد جاسم التقرير والواجب اليومي لمادة الرياضيات: حل التمارين 1 إلى 5 صفحة 42.",
          type: "REPORT",
          link: "/student/reports",
          isRead: false,
        },
        {
          tenantId: tenant.id,
          userId: student.id,
          title: "إعلان نتائج وتقييمات دراسية 🎓",
          message: "تم اعتماد ونشر درجات الشهر الأول لمادة الرياضيات - يمكنك الاطلاع على بطاقة درجاتك الآن.",
          type: "GRADE",
          link: "/student/grades",
          isRead: false,
        },
        {
          tenantId: tenant.id,
          userId: student.id,
          title: "وصل استلام قسط دراسي 💳",
          message: "تم تسجيل دفعة بقيمة 250,000 د.ع وإصدار الوصل (REC-2025-0001) بنجاح.",
          type: "PAYMENT",
          link: "/student/payments",
          isRead: true,
        },
      ],
    });
  }

  console.log("✅ Seeded in-app notifications successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
