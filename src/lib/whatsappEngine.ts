/**
 * WhatsApp Notification Queue & Template Engine (Baileys compatible)
 * Implements the 8 core automated triggers
 */

export type WhatsAppEventType =
  | "ACCOUNT_ACTIVATED"
  | "MISSING_DOCS"
  | "REPORT_APPROVED"
  | "STUDENT_ABSENT"
  | "LEAVE_STATUS"
  | "PAYMENT_RECEIPT"
  | "PAYMENT_OVERDUE"
  | "GRADES_PUBLISHED";

export interface WhatsAppPayload {
  schoolName: string;
  studentName: string;
  guardianName?: string;
  guardianPhone: string;
  eventType: WhatsAppEventType;
  details: Record<string, any>;
}

export function generateWhatsAppMessage(payload: WhatsAppPayload): string {
  const { schoolName, studentName, guardianName, eventType, details } = payload;
  const greeting = guardianName ? `حضرة ولي أمر الطالب/ـة (${studentName}) المحترم` : `حضرة ولي أمر الطالب/ـة (${studentName})`;

  switch (eventType) {
    case "ACCOUNT_ACTIVATED":
      return `🏫 *${schoolName}*
السلام عليكم ورحمة الله وبركاته،
${greeting}،
تم بنجاح تفعيل الحساب الإلكتروني للطالب في منصة المدرسة.

👤 اسم المستخدم: \`${details.username}\`
🔑 كلمة المرور المؤقتة: \`${details.password}\`
🔗 رابط بوابة الطالب: ${details.loginUrl || "https://school.al-nukhba.iq/login"}

⚠️ يرجى تغيير كلمة المرور عند أول تسجيل دخول.
مع تحيات الإدارة المدرسية.`;

    case "MISSING_DOCS":
      return `🏫 *${schoolName}*
${greeting}،
نود تذكيركم بضرورة استكمال المستمسكات الرسمية التالية لملف الطالب:
${details.missingList ? details.missingList.map((doc: string, idx: number) => `▫️ ${doc}`).join("\n") : "▫️ المستمسكات الناقصة المطلوبة"}

يرجى تسليمها للإدارة أو رفعها عبر بوابة الطالب خلال 48 ساعة لتجنب تعليق القيد.
شاكرين حسن تعاونكم.`;

    case "REPORT_APPROVED":
      return `🏫 *${schoolName}*
${greeting}،
📌 *تقرير دراسي وواجب بيتي جديد*
📚 المادة: ${details.subjectName}
👨‍🏫 الأستاذ: ${details.teacherName}
📝 الموضوع: ${details.title}
📖 الواجب المطلوب: ${details.homework || "مراجعة الدرس"}

يمكنكم متابعة التفاصيل عبر بوابة الطالب.`;

    case "STUDENT_ABSENT":
      return `🏫 *${schoolName}*
⚠️ *تنبيه غياب*
${greeting}،
نحيطكم علماً بأن الطالب/ـة (${studentName}) غائب عن الدوام المدرسي لهذا اليوم (${details.date}).
يرجى التواصل مع إدارة المدرسة أو تقديم طلب إجازة رسمي عبر المنصة لتبرير الغياب.`;

    case "LEAVE_STATUS":
      return `🏫 *${schoolName}*
${greeting}،
بخصوص طلب الإجازة المقدم ليوم (${details.date}):
الحالة: *${details.isApproved ? "✅ تمت الموافقة على الإجازة" : "❌ تم رفض الطلب"}*
${details.rejectionReason ? `السبب: ${details.rejectionReason}` : "تم تسجيل الطالب مجازاً في سجلات الحضور الرسمية."}`;

    case "PAYMENT_RECEIPT":
      return `🏫 *${schoolName}*
🧾 *وصل استلام قسط مدرسي*
${greeting}،
تم بنجاح استلام دفعة من القسط الدراسي للطالب:
🔢 رقم الوصل: \`${details.receiptNumber}\`
💰 المبلغ المسدد: ${Number(details.amount).toLocaleString()} ${details.currency || "د.ع"}
💳 المتبقي من القسط الكلي: ${Number(details.remainingBalance).toLocaleString()} ${details.currency || "د.ع"}
📅 تاريخ الدفع: ${details.paymentDate}

شكراً لالتزامكم ودمتم بخير.`;

    case "PAYMENT_OVERDUE":
      return `🏫 *${schoolName}*
تذكير بسداد القسط الدراسي 💳
${greeting}،
نود تذكيركم بلطف بأن هناك متبقي من القسط الدراسي للطالب:
💰 المبلغ المتبقي: ${Number(details.remainingBalance).toLocaleString()} ${details.currency || "د.ع"}
يرجى مراجعة الحسابات في الإدارة لإتمام التسديد شاكرين تفهمكم وتعاونكم الدائم.`;

    case "GRADES_PUBLISHED":
      return `🏫 *${schoolName}*
📊 *إعلان نتائج الامتحانات*
${greeting}،
تم رصد واعتماد نتائج امتحانات (${details.phaseName}) لصف الطالب.
يمكنكم الآن الاطلاع على كشف الدرجات التفصيلي عبر تسجيل الدخول لحساب الطالب بالمنصة.
تمنياتنا لطلابنا الأعزاء بدوام التفوق والنجاح.`;

    default:
      return `🏫 *${schoolName}*\n${greeting}\nإشعار جديد من إدارة المدرسة.`;
  }
}
