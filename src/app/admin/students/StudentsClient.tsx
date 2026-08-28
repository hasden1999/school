"use client";

import React, { useState, useEffect } from "react";
import {
  registerStudentAction,
  updateStudentAction,
  archiveStudentAction,
  unarchiveStudentAction,
  deleteStudentAction,
} from "@/app/actions/studentActions";
import { StudentRepository } from "@/lib/repositories/StudentRepository";
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
  Edit2,
  Trash2,
  ArchiveRestore,
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
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "ARCHIVED" | "GRADUATED" | "ALL">("ACTIVE");
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

  // Edit Student State
  const [selectedEditStudent, setSelectedEditStudent] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    guardianName: "",
    guardianPhone: "",
    classRoomId: "",
    sectionId: "",
    totalTuition: 1500000,
    depositAmount: 0,
    address: "",
    dateOfBirth: "",
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

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
  const editAvailableSections = sections.filter((s) => s.classRoomId === editFormData.classRoomId);

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

  const handleOpenEdit = (student: any) => {
    setSelectedEditStudent(student);
    setEditFormData({
      fullName: student.user?.fullName || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      classRoomId: student.classRoomId || classRooms[0]?.id || "",
      sectionId: student.sectionId || "",
      totalTuition: student.totalTuition || 1500000,
      depositAmount: student.depositAmount || 0,
      address: student.address || "",
      dateOfBirth: student.dateOfBirth || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditStudent) return;
    setSubmittingEdit(true);

    try {
      const res = await updateStudentAction(selectedEditStudent.id, {
        ...editFormData,
        sectionId: editFormData.sectionId || editAvailableSections[0]?.id || "",
      });

      if (res.success) {
        alert("✓ تم حفظ تعديل بيانات الطالب بنجاح!");
        setStudents((prev) =>
          prev.map((st) =>
            st.id === selectedEditStudent.id
              ? {
                  ...st,
                  guardianName: editFormData.guardianName,
                  guardianPhone: editFormData.guardianPhone,
                  totalTuition: editFormData.totalTuition,
                  depositAmount: editFormData.depositAmount,
                  classRoomId: editFormData.classRoomId,
                  sectionId: editFormData.sectionId,
                  classRoom: classRooms.find((c) => c.id === editFormData.classRoomId) || st.classRoom,
                  section: sections.find((s) => s.id === editFormData.sectionId) || st.section,
                  user: { ...st.user, fullName: editFormData.fullName, phone: editFormData.guardianPhone },
                }
              : st
          )
        );
        setSelectedEditStudent(null);
      } else {
        alert(res.error || "فشل تعديل بيانات الطالب");
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleArchive = async (student: any) => {
    const isArchived = student.registrationStatus === "ARCHIVED";
    const actionName = isArchived ? "استعادة من الأرشيف" : "أرشفة الطالب";
    if (!confirm(`هل أنت متأكد من ${actionName} للطالب (${student.user?.fullName})؟`)) return;

    try {
      const res = isArchived
        ? await unarchiveStudentAction(student.id)
        : await archiveStudentAction(student.id);

      if (res.success) {
        alert(`✓ ${res.message}`);
        setStudents((prev) =>
          prev.map((st) =>
            st.id === student.id
              ? { ...st, registrationStatus: isArchived ? "ACTIVE" : "ARCHIVED" }
              : st
          )
        );
      } else {
        alert(res.error || "فشلت العملية");
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    }
  };

  const handleDeleteStudent = async (student: any) => {
    if (
      !confirm(
        `تحذير نهائي: هل أنت متأكد من حذف الطالب (${student.user?.fullName}) وجميع سجلاته؟ لا يمكن التراجع عن هذه الخطوة!`
      )
    ) {
      return;
    }

    try {
      const res = await deleteStudentAction(student.id);
      if (res.success) {
        alert("✓ تم حذف الطالب بنجاح.");
        setStudents((prev) => prev.filter((st) => st.id !== student.id));
      } else {
        alert(res.error || "فشل حذف الطالب");
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    }
  };

  // Load from Repository if initialStudents is empty or offline
  useEffect(() => {
    async function loadLocalStudents() {
      if (!initialStudents || initialStudents.length === 0 || (typeof window !== "undefined" && !navigator.onLine)) {
        const localList = await StudentRepository.getStudents();
        if (localList && localList.length > 0) {
          setStudents(localList);
        }
      }
    }
    loadLocalStudents();
  }, [initialStudents]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        sectionId: formData.sectionId || availableSections[0]?.id || "",
      };

      const res = await StudentRepository.createStudent(payload as any);
      if (res.success && res.student) {
        setStudents((prev) => [res.student, ...prev]);
        setRegisteredData({
          success: true,
          student: res.student,
          credentials: {
            username: res.student.user?.username || "تم التسجيل محلياً",
            tempPassword: res.student.user?.username ? `${res.student.user?.username}123` : "123456",
            studentNumber: res.student.studentNumber,
          },
          depositReceipt: res.student.paymentReceipts?.[0],
        });
        setIsRegisterOpen(false);
      } else if (res.error) {
        alert(res.error);
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">سجل الطلاب والأرشيف وقسم الخريجين</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تسجيل الطلاب الجدد وتوليد الحسابات، الأقساط والمستمسكات، وأرشيف خريجي المدرسة الدائم.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleSendDocsReminders}
            disabled={sendingReminders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-sm"
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل طالب جديد + عربون</span>
          </button>
        </div>
      </div>

      {reminderResult && (
        <div className="p-4 rounded-lg bg-slate-50 text-slate-700 text-xs font-mono border border-slate-200 space-y-1">
          <p className="text-brand-700 font-bold">تم تشغيل طابور واتساب:</p>
          <p>{reminderResult}</p>
        </div>
      )}

      {/* Primary Section Tabs: Active Students vs Alumni & Graduates Archive */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-xs w-fit">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "ACTIVE"
              ? "bg-brand-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>الطلاب المنتظمون ({activeCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("GRADUATED")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "GRADUATED"
              ? "bg-brand-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>قسم الخريجين والأرشيف الدائم ({graduatedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "ALL"
              ? "bg-brand-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span>السجل الشامل ({students.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar with Quick Classroom Pills */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "GRADUATED"
                  ? "بحث في أرشيف الخريجين (الاسم، الرقم المدرسي، سنة التخرج، الهاتف)..."
                  : "بحث سريع باسم الطالب، ولي الأمر، الرقم المدرسي، أو الهاتف..."
              }
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">الصفوف:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            >
              <option value="ALL">جميع الصفوف ({students.length})</option>
              {classRooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Clickable Class Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedClass("ALL")}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              selectedClass === "ALL"
                ? "bg-brand-700 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            الكل ({students.length})
          </button>
          {classRooms.map((c) => {
            const count = students.filter((s) => s.classRoomId === c.id).length;
            const isSel = selectedClass === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClass(c.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSel
                    ? "bg-brand-700 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSel ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Students Table for Desktop & Tablet */}
      <div className="card-surface overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
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
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-medium">
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
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      >
                        <td
                          className="p-4 font-bold text-slate-400"
                          onClick={() => setSelectedQuickStudent(s)}
                        >
                          {idx + 1}
                        </td>
                        <td className="p-4" onClick={() => setSelectedQuickStudent(s)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-brand-100 group-hover:text-brand-700 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors shrink-0 border border-slate-200">
                              {s.user.fullName.slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors flex items-center gap-1.5">
                                <span>{s.user.fullName}</span>
                                <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-brand-600 transition-opacity" />
                              </div>
                              <div className="text-xs text-slate-600 font-mono flex items-center gap-2">
                                <span>{s.studentNumber}</span>
                                <span>•</span>
                                <span>{s.guardianPhone}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-mono font-bold border border-brand-100" title="اسم المستخدم الخماسي">
                                  {s.user.username}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-mono font-bold border border-amber-100" title="رمز الدخول الخماسي">
                                  {s.user.plainPasscode || "••••••"}
                                </span>
                                <button
                                  type="button"
                                  title="نسخ بيانات الدخول"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const text = `اسم المستخدم: ${s.user.username}\nرمز المرور: ${s.user.plainPasscode || "(تم تغييره)"}`;
                                    navigator.clipboard.writeText(text);
                                    alert(`✓ تم نسخ بيانات الدخول للطالب (${s.user.fullName})!`);
                                  }}
                                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
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
                              <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                                خريج ({s.graduationYear || "الأرشيف"})
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
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-slate-900">
                                {Number(paid).toLocaleString()} {currency}
                              </span>
                              <span className="text-slate-500">
                                من {Number(s.totalTuition).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  remaining === 0 ? "bg-brand-600" : "bg-blue-500"
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
                              <span className="text-xs text-rose-600 font-bold block">
                                المتبقي: {Number(remaining).toLocaleString()} {currency}
                              </span>
                            ) : (
                              <span className="text-xs text-brand-700 font-bold block">
                                مسدد بالكامل
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(s)}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors shadow-xs border border-amber-200"
                              title="تعديل بيانات الطالب وولي الأمر والصف"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedQuickStudent(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs border border-brand-100"
                              title="فتح الملف الشامل، تسديد قسط فوري، أو إدارة المستمسكات"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>تسديد / ملف</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedReportStudent(s)}
                              className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                              title="عرض وطباعة السجل الأكاديمي والشهادة الرسمية"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>{isGraduated ? "الوثيقة" : "الشهادة"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleArchive(s)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs border ${
                                s.registrationStatus === "ARCHIVED"
                                  ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                              }`}
                              title={s.registrationStatus === "ARCHIVED" ? "استعادة الطالب من الأرشيف" : "أرشفة الطالب"}
                            >
                              {s.registrationStatus === "ARCHIVED" ? (
                                <ArchiveRestore className="w-3.5 h-3.5" />
                              ) : (
                                <Archive className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(s)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors shadow-xs border border-rose-200"
                              title="حذف الطالب نهائياً من المنظومة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Mobile-Friendly Responsive Cards Layout (للشاشات الصغيرة والهواتف) */}
      <div className="md:hidden space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="card-surface p-8 text-center text-slate-500 font-medium">
            لا توجد سجلات مطابقة للبحث أو التبويب المحدد.
          </div>
        ) : (
          filteredStudents.map((s) => {
            const missingDocs = s.documents.filter(
              (d: any) => d.status === "MISSING" && d.requirement.isRequired
            );
            const paid =
              s.paymentReceipts.reduce((sum: number, r: any) => sum + r.amount, 0) +
              s.depositAmount;
            const remaining = s.totalTuition - paid;

            return (
              <div
                key={s.id}
                className="card-surface p-4 space-y-3 border border-slate-200 bg-white shadow-2xs"
              >
                {/* Header: Student Name + Class */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {s.user.fullName.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{s.user.fullName}</h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {s.classRoom.name} — شعبة ({s.section.name})
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                    {s.studentNumber}
                  </span>
                </div>

                {/* Financial & Documents Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">المتبقي من القسط:</span>
                    <strong className={`font-bold ${remaining > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                      {remaining > 0 ? `${Number(remaining).toLocaleString()} ${currency}` : "مسدد بالكامل ✅"}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">المستمسكات:</span>
                    <strong className={`font-bold ${missingDocs.length === 0 ? "text-emerald-700" : "text-amber-700"}`}>
                      {missingDocs.length === 0 ? "مكتملة (5/5) ✅" : `ناقصة (${missingDocs.length}) ⚠️`}
                    </strong>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedQuickStudent(s)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>تسديد / الملف</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedReportStudent(s)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>الشهادة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200"
                    title="تعديل البيانات"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الصف والمرحلة *</label>
              <select
                value={formData.classRoomId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عربون التسجيل المستلم ({currency})</label>
              <input
                type="number"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة دفع العربون</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
              >
                <option value="CASH">نقداً (صندوق المدرسة)</option>
                <option value="BANK_TRANSFER">تحويل مصرفي / إيداع</option>
                <option value="ZAIN_CASH">زين كاش / آسيا حوالة</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            بمجرد الحفظ، سيقوم النظام تلقائياً بـ: توليد اسم مستخدم وكلمة مرور للطالب + إنشاء كشف الدرجات والمستمسكات + إصدار وصل مالي للعربون + جدولة رسالة واتساب لولي الأمر ببيانات الدخول.
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
              className="px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
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
            <div className="w-12 h-12 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">{registeredData.user.fullName}</h4>
              <p className="text-xs text-slate-500 mt-0.5">تم تفعيل الحساب وإصدار وصل العربون برقم: {registeredData.receiptNumber}</p>
            </div>

            {/* Credentials Card */}
            <div className="p-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-right text-xs space-y-2 font-mono">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-cairo">اسم المستخدم (5 أحرف):</span>
                <span className="font-bold text-brand-700 text-sm">{registeredData.username}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-cairo">رمز المرور (5 أحرف):</span>
                <span className="font-bold text-amber-700 text-sm">{registeredData.rawPassword}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const text = `بيانات الدخول لمنظومة المدرسة:\nالطالب: ${registeredData.user.fullName}\nاسم المستخدم: ${registeredData.username}\nرمز المرور: ${registeredData.rawPassword}\nرابط المنظومة: ${window.location.origin}/login`;
                  navigator.clipboard.writeText(text);
                  alert("✓ تم نسخ بيانات الدخول للطالب بنجاح!");
                }}
                className="w-full mt-2 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-cairo font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ بيانات الدخول للطالب</span>
              </button>
            </div>

            <p className="text-xs text-brand-700 bg-brand-50 p-3 rounded-lg border border-brand-100">
              تمت إضافة رسالة واتساب تلقائية ببيانات الدخول لطابور الإرسال لولي الأمر.
            </p>

            <button
              onClick={() => {
                setRegisteredData(null);
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800"
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

      {/* Edit Student Information Modal */}
      {selectedEditStudent && (
        <Modal
          isOpen={!!selectedEditStudent}
          onClose={() => setSelectedEditStudent(null)}
          title={`تعديل بيانات الطالب: ${selectedEditStudent.user?.fullName}`}
          maxWidth="xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 font-cairo">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الطالب الكامل *</label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم ولي الأمر *</label>
                <input
                  type="text"
                  required
                  value={editFormData.guardianName}
                  onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم هاتف ولي الأمر (واتساب) *</label>
                <input
                  type="text"
                  required
                  value={editFormData.guardianPhone}
                  onChange={(e) => setEditFormData({ ...editFormData, guardianPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الصف الدراسي *</label>
                <select
                  value={editFormData.classRoomId}
                  onChange={(e) => {
                    const newClassId = e.target.value;
                    const secs = sections.filter((s) => s.classRoomId === newClassId);
                    setEditFormData({
                      ...editFormData,
                      classRoomId: newClassId,
                      sectionId: secs[0]?.id || "",
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                >
                  {classRooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشعبة الدراسية *</label>
                <select
                  value={editFormData.sectionId}
                  onChange={(e) => setEditFormData({ ...editFormData, sectionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                >
                  {editAvailableSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      شعبة {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">القسط السنوي الكلي ({currency}) *</label>
                <input
                  type="number"
                  required
                  value={editFormData.totalTuition}
                  onChange={(e) => setEditFormData({ ...editFormData, totalTuition: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مبلغ العربون / الدفعة الأولى ({currency})</label>
                <input
                  type="number"
                  value={editFormData.depositAmount}
                  onChange={(e) => setEditFormData({ ...editFormData, depositAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">السكن والعنوان</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="مثال: بغداد - الكرخ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedEditStudent(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submittingEdit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-all shadow-sm"
              >
                {submittingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>حفظ تعديل بيانات الطالب</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
