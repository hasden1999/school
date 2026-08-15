"use client";

import React, { useState } from "react";
import { registerStudentAction } from "@/app/actions/studentActions";
import { sendMissingDocsWhatsAppRemindersAction } from "@/app/actions/documentActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { StudentReportCardModal } from "@/components/print/StudentReportCardModal";
import { PaymentReceiptModal } from "@/components/print/PaymentReceiptModal";
import { StudentQuickProfileModal } from "@/components/students/StudentQuickProfileModal";
import {
  GraduationCap,
  Plus,
  Search,
  FolderLock,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Copy,
  MessageSquare,
  RefreshCw,
  Phone,
  Archive,
  BookOpen,
  History,
  Building2,
  Eye,
  SlidersHorizontal,
} from "lucide-react";

interface StudentsClientProps {
  students: any[];
  classRooms: any[];
  sections: any[];
  currency: string;
}

export const StudentsClient: React.FC<StudentsClientProps> = ({
  students: initialStudents,
  classRooms,
  sections,
  currency,
}) => {
  const [students, setStudents] = useState<any[]>(initialStudents);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "GRADUATED" | "ALL">("ACTIVE");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);

  // Modals state
  const [selectedQuickStudent, setSelectedQuickStudent] = useState<any>(null);
  const [selectedReportStudent, setSelectedReportStudent] = useState<any>(null);
  const [reportInitialPhase, setReportInitialPhase] = useState<string>("FULL");
  const [selectedReceiptData, setSelectedReceiptData] = useState<{ receipt: any; student: any } | null>(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    guardianName: "",
    guardianPhone: "+96477",
    classRoomId: classRooms[0]?.id || "",
    sectionId: "",
    totalTuition: 1500000,
    depositAmount: 300000,
    paymentMethod: "CASH",
    depositNotes: "عربون التسجيل الأولي وتثبيت المقعد",
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter sections by selected classroom
  const availableSections = sections.filter((s) => s.classRoomId === formData.classRoomId);

  const handleClassChange = (classId: string) => {
    const selectedC = classRooms.find((c) => c.id === classId);
    const secs = sections.filter((s) => s.classRoomId === classId);
    setFormData({
      ...formData,
      classRoomId: classId,
      sectionId: secs[0]?.id || "",
      totalTuition: selectedC?.annualTuition || 1500000,
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await registerStudentAction({
        ...formData,
        sectionId: formData.sectionId || availableSections[0]?.id,
      });
      if (res.success) {
        setRegisteredData(res);
        setIsRegisterOpen(false);
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ أثناء تسجيل الطالب");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendDocsReminders = async () => {
    setSendingReminders(true);
    setReminderResult(null);
    try {
      const rep = await sendMissingDocsWhatsAppRemindersAction();
      setReminderResult(`تمت جدولة ${rep.count} رسالة واتساب لأولياء الأمور الذين لديهم مستمسكات ناقصة.`);
    } catch (e: any) {
      alert(e.message || "خطأ أثناء إرسال التذكيرات");
    } finally {
      setSendingReminders(false);
    }
  };

  // Filter students based on activeTab, searchTerm, and selectedClass
  const filteredStudents = students.filter((s) => {
    // Tab filter
    if (activeTab === "ACTIVE" && s.registrationStatus !== "ACTIVE") return false;
    if (activeTab === "GRADUATED" && s.registrationStatus !== "GRADUATED" && s.registrationStatus !== "ARCHIVED")
      return false;

    // Search filter across all fields
    const matchesSearch =
      s.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guardianPhone.includes(searchTerm) ||
      (s.graduationYear && s.graduationYear.includes(searchTerm));

    // Class filter
    const matchesClass = selectedClass === "ALL" || s.classRoomId === selectedClass;

    return matchesSearch && matchesClass;
  });

  const activeCount = students.filter((s) => s.registrationStatus === "ACTIVE").length;
  const graduatedCount = students.filter(
    (s) => s.registrationStatus === "GRADUATED" || s.registrationStatus === "ARCHIVED"
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">سجل الطلاب والأرشيف وقسم الخريجين</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تسجيل الطلاب الجدد وتوليد الحسابات، الأقساط والمستمسكات، وأرشيف خريجي المدرسة الدائم.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleSendDocsReminders}
            disabled={sendingReminders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md"
          >
            {sendingReminders ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            <span>تذكير واتساب للمستمسكات الناقصة</span>
          </button>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل طالب جديد + عربون</span>
          </button>
        </div>
      </div>

      {reminderResult && (
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono border border-slate-800 space-y-1">
          <p className="text-emerald-400 font-bold">✅ تم تشغيل طابور واتساب:</p>
          <p>{reminderResult}</p>
        </div>
      )}

      {/* Primary Section Tabs: Active Students vs Alumni & Graduates Archive */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ACTIVE"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>الطلاب المنتظمون ({activeCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("GRADUATED")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "GRADUATED"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>قسم الخريجين والأرشيف الدائم ({graduatedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ALL"
              ? "bg-slate-700 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>السجل الشامل ({students.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === "GRADUATED"
                ? "بحث في أرشيف الخريجين (الاسم، الرقم المدرسي، سنة التخرج، الهاتف)..."
                : "بحث باسم الطالب، ولي الأمر، الرقم المدرسي، أو الهاتف..."
            }
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
        >
          <option value="ALL">جميع المراحل والصفوف</option>
          {classRooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-800">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">الطالب</th>
                <th className="p-4">الصف والشعبة</th>
                <th className="p-4">الحالة المدرسية</th>
                <th className="p-4">المستمسكات</th>
                <th className="p-4">موقف القسط</th>
                <th className="p-4 text-center">الشهادة والسجل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    لا توجد سجلات مطابقة للبحث أو التبويب المحدد.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const missingDocs = s.documents.filter(
                    (d: any) => d.status === "MISSING" && d.requirement.isRequired
                  );
                  const paid =
                    s.paymentReceipts.reduce((sum: number, r: any) => sum + r.amount, 0) +
                    s.depositAmount;
                  const remaining = s.totalTuition - paid;
                  const isGraduated =
                    s.registrationStatus === "GRADUATED" || s.registrationStatus === "ARCHIVED";

                  return (
                      <tr
                        key={s.id}
                        className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                      >
                        <td
                          className="p-4 font-bold text-slate-400"
                          onClick={() => setSelectedQuickStudent(s)}
                        >
                          {idx + 1}
                        </td>
                        <td className="p-4" onClick={() => setSelectedQuickStudent(s)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-700 text-slate-700 flex items-center justify-center font-black text-sm transition-colors shrink-0 border border-slate-200/80">
                              {s.user.fullName.slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                                <span>{s.user.fullName}</span>
                                <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                                <span>{s.studentNumber}</span>
                                <span>•</span>
                                <span>{s.guardianPhone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          className="p-4 font-semibold text-slate-700"
                          onClick={() => setSelectedQuickStudent(s)}
                        >
                          {s.classRoom.name} ({s.section.name})
                        </td>

                        <td className="p-4" onClick={() => setSelectedQuickStudent(s)}>
                          {isGraduated ? (
                            <div className="space-y-0.5">
                              <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-black text-[11px] border border-indigo-200">
                                🎓 خريج ({s.graduationYear || "الأرشيف"})
                              </span>
                            </div>
                          ) : (
                            <Badge variant="success">مقيد منتظم</Badge>
                          )}
                        </td>

                        <td className="p-4" onClick={() => setSelectedQuickStudent(s)}>
                          {missingDocs.length === 0 ? (
                            <Badge variant="success">مكتملة (5/5)</Badge>
                          ) : (
                            <Badge variant="danger">ناقصة ({missingDocs.length})</Badge>
                          )}
                        </td>

                        <td className="p-4" onClick={() => setSelectedQuickStudent(s)}>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-bold text-slate-900">
                                {Number(paid).toLocaleString()} {currency}
                              </span>
                              <span className="text-slate-400">
                                من {Number(s.totalTuition).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  remaining === 0 ? "bg-emerald-500" : "bg-blue-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round((paid / s.totalTuition) * 100)
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            {remaining > 0 ? (
                              <span className="text-[10px] text-rose-600 font-bold block">
                                المتبقي: {Number(remaining).toLocaleString()} {currency}
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-bold block">
                                مسدد بالكامل ✅
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedQuickStudent(s)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm border border-emerald-200"
                              title="فتح الملف الشامل، تسديد قسط فوري، أو إدارة المستمسكات"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>تسديد / ملف</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedReportStudent(s)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                              title="عرض وطباعة السجل الأكاديمي والشهادة الرسمية"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>{isGraduated ? "الوثيقة" : "الشهادة"}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Registration Modal */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="تسجيل طالب جديد + تثبيت العربون" maxWidth="xl">
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب الرباعي *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="كرار حيدر جاسم الموسوي"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم ولي الأمر الثلاثي *</label>
              <input
                type="text"
                required
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="حيدر جاسم الموسوي"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم واتساب ولي الأمر *</label>
              <input
                type="text"
                required
                dir="ltr"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+9647701234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الصف والمرحلة *</label>
              <select
                value={formData.classRoomId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-500 bg-white"
              >
                {classRooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الشعبة *</label>
              <select
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-500 bg-white"
              >
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    شعبة ({s.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">القسط السنوي الكلي ({currency})</label>
              <input
                type="number"
                value={formData.totalTuition}
                onChange={(e) => setFormData({ ...formData, totalTuition: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عربون التسجيل المستلم ({currency})</label>
              <input
                type="number"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة دفع العربون</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-500 bg-white"
              >
                <option value="CASH">نقداً (صندوق المدرسة)</option>
                <option value="BANK_TRANSFER">تحويل مصرفي / إيداع</option>
                <option value="ZAIN_CASH">زين كاش / آسيا حوالة</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            💡 بمجرد الحفظ، سيقوم النظام تلقائياً بـ: توليد اسم مستخدم وكلمة مرور للطالب + إنشاء كشف الدرجات والمستمسكات + إصدار وصل مالي للعربون + جدولة رسالة واتساب لولي الأمر ببيانات الدخول.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
            >
              {submitting ? "جاري التسجيل..." : "تأكيد التسجيل وتوليد الحساب"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Account Created Success Notification Modal */}
      {registeredData && (
        <Modal isOpen={!!registeredData} onClose={() => setRegisteredData(null)} title="تم تسجيل الطالب وتوليد الحساب بنجاح!" maxWidth="md">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900">{registeredData.user.fullName}</h4>
              <p className="text-xs text-slate-500 mt-0.5">تم تفعيل الحساب وإصدار وصل العربون برقم: {registeredData.receiptNumber}</p>
            </div>

            {/* Credentials Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl text-right text-xs space-y-2 font-mono">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-slate-400 font-cairo">اسم المستخدم:</span>
                <span className="font-bold text-emerald-400 text-sm">{registeredData.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-cairo">كلمة المرور المؤقتة:</span>
                <span className="font-bold text-emerald-400 text-sm">{registeredData.rawPassword}</span>
              </div>
            </div>

            <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              📲 تمت إضافة رسالة واتساب تلقائية ببيانات الدخول لطابور الإرسال لولي الأمر.
            </p>

            <button
              onClick={() => {
                setRegisteredData(null);
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              تم ومتابعة
            </button>
          </div>
        </Modal>
      )}

      {/* Student Quick Profile & Instant Payment Modal */}
      <StudentQuickProfileModal
        isOpen={!!selectedQuickStudent}
        onClose={() => setSelectedQuickStudent(null)}
        student={selectedQuickStudent}
        currency={currency}
        onOpenReportCard={(st, phase) => {
          setSelectedReportStudent(st);
          if (phase) setReportInitialPhase(phase);
        }}
        onOpenReceipt={(rec, st) => setSelectedReceiptData({ receipt: rec, student: st })}
      />

      {/* Student Report Card Printable Modal */}
      <StudentReportCardModal
        isOpen={!!selectedReportStudent}
        onClose={() => setSelectedReportStudent(null)}
        student={selectedReportStudent}
        initialPhase={reportInitialPhase}
      />

      {/* Payment Receipt Modal */}
      {selectedReceiptData && (
        <PaymentReceiptModal
          isOpen={!!selectedReceiptData}
          onClose={() => setSelectedReceiptData(null)}
          receipt={selectedReceiptData.receipt}
          student={selectedReceiptData.student}
          currency={currency}
        />
      )}
    </div>
  );
};
