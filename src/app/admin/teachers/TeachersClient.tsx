"use client";

import React, { useState } from "react";
import {
  createTeacherAction,
  updateTeacherSalaryAction,
  updateTeacherAction,
  deleteTeacherAction,
} from "@/app/actions/teacherActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Plus,
  BookOpen,
  Trash2,
  Phone,
  CheckCircle2,
  Lock,
  DollarSign,
  Wallet,
  Edit2,
  Save,
  Copy,
  KeyRound,
  Search,
  RefreshCw,
} from "lucide-react";

interface TeachersClientProps {
  teachers: any[];
  classRooms: any[];
  sections: any[];
  subjects: any[];
  currency?: string;
}

export const TeachersClient: React.FC<TeachersClientProps> = ({
  teachers: initialTeachers,
  classRooms,
  sections,
  subjects,
  currency = "د.ع",
}) => {
  const [teachers, setTeachers] = useState<any[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createdResult, setCreatedResult] = useState<any>(null);

  // Edit Teacher State
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editMonthlySalary, setEditMonthlySalary] = useState<number>(850000);
  const [editAssignments, setEditAssignments] = useState<
    Array<{ classRoomId: string; sectionId: string; subjectId: string }>
  >([]);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+96477");
  const [monthlySalary, setMonthlySalary] = useState<number>(850000);
  const [assignments, setAssignments] = useState<Array<{ classRoomId: string; sectionId: string; subjectId: string }>>([
    {
      classRoomId: classRooms[0]?.id || "",
      sectionId: sections[0]?.id || "",
      subjectId: subjects[0]?.id || "",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Edit salary state
  const [editingSalaryTeacherId, setEditingSalaryTeacherId] = useState<string | null>(null);
  const [salaryInput, setSalaryInput] = useState<number>(0);
  const [savingSalary, setSavingSalary] = useState(false);

  const totalPayroll = teachers.reduce((sum, t) => sum + (t.monthlySalary || 0), 0);

  const handleAddAssignment = () => {
    setAssignments([
      ...assignments,
      {
        classRoomId: classRooms[0]?.id || "",
        sectionId: sections[0]?.id || "",
        subjectId: subjects[0]?.id || "",
      },
    ]);
  };

  const handleRemoveAssignment = (index: number) => {
    if (assignments.length > 1) {
      setAssignments(assignments.filter((_, i) => i !== index));
    }
  };

  const handleAssignmentChange = (index: number, field: string, value: string) => {
    const updated = [...assignments];
    (updated[index] as any)[field] = value;
    setAssignments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createTeacherAction({
        fullName,
        phone,
        monthlySalary: Number(monthlySalary),
        assignments,
      });
      if (res.success) {
        setCreatedResult(res);
        setIsCreateOpen(false);
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ أثناء إضافة المعلم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (t: any) => {
    setEditingTeacher(t);
    setEditFullName(t.fullName || "");
    setEditPhone(t.phone || "");
    setEditMonthlySalary(t.monthlySalary || 0);
    setEditAssignments(
      t.teacherAssignments?.map((a: any) => ({
        classRoomId: a.classRoomId,
        sectionId: a.sectionId,
        subjectId: a.subjectId,
      })) || [
        {
          classRoomId: classRooms[0]?.id || "",
          sectionId: sections[0]?.id || "",
          subjectId: subjects[0]?.id || "",
        },
      ]
    );
  };

  const handleAddEditAssignment = () => {
    setEditAssignments([
      ...editAssignments,
      {
        classRoomId: classRooms[0]?.id || "",
        sectionId: sections[0]?.id || "",
        subjectId: subjects[0]?.id || "",
      },
    ]);
  };

  const handleRemoveEditAssignment = (index: number) => {
    if (editAssignments.length > 1) {
      setEditAssignments(editAssignments.filter((_, i) => i !== index));
    }
  };

  const handleEditAssignmentChange = (index: number, field: string, value: string) => {
    const updated = [...editAssignments];
    (updated[index] as any)[field] = value;
    setEditAssignments(updated);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setSubmittingEdit(true);

    try {
      const res = await updateTeacherAction(editingTeacher.id, {
        fullName: editFullName,
        phone: editPhone,
        monthlySalary: editMonthlySalary,
        assignments: editAssignments,
      });

      if (res.success) {
        alert("✓ تم حفظ تعديل بيانات المعلم وتخصيصاته بنجاح!");
        window.location.reload();
      } else {
        alert(res.error || "فشل تعديل بيانات المعلم");
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteTeacher = async (t: any) => {
    if (!confirm(`هل أنت متأكد من حذف المعلم (${t.fullName}) وجميع سجلاته وتخصيصاته؟`)) return;

    try {
      const res = await deleteTeacherAction(t.id);
      if (res.success) {
        alert("✓ تم حذف المعلم بنجاح.");
        setTeachers((prev) => prev.filter((item) => item.id !== t.id));
      } else {
        alert(res.error || "فشل حذف المعلم");
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    }
  };

  const handleSaveSalary = async (teacherId: string) => {
    setSavingSalary(true);
    try {
      await updateTeacherSalaryAction(teacherId, salaryInput);
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, monthlySalary: salaryInput } : t))
      );
      setEditingSalaryTeacherId(null);
    } catch (e: any) {
      alert(e.message || "خطأ أثناء تحديث الراتب");
    } finally {
      setSavingSalary(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.fullName.toLowerCase().includes(term) ||
      t.username.toLowerCase().includes(term) ||
      (t.phone && t.phone.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">الهيئة التعليمية والمعلمون</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            إدارة المعلمين وتعيين الصفوف والمواد الدراسية ومتابعة الحسابات والرواتب الشهرية.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة معلم جديد</span>
        </button>
      </div>

      {/* Search and Summary Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث سريع باسم المعلم، المعرف (@username)، أو رقم الهاتف..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 text-xs font-bold">
          <span className="px-3 py-2 bg-purple-50 text-purple-800 rounded-xl border border-purple-200">
            {filteredTeachers.length} من {teachers.length} معلم
          </span>
          <span className="px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            كتلة الرواتب: {Number(totalPayroll).toLocaleString()} {currency}
          </span>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base border border-emerald-100">
                    {t.fullName.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{t.fullName}</h3>
                    <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                      @{t.username}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={t.active ? "success" : "neutral"}>
                    {t.active ? "نشط" : "معطل"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                    title="تعديل بيانات المعلم والمواد المسندة"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTeacher(t)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="حذف المعلم وسجلاته"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {t.phone && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-mono" dir="ltr">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {t.phone}
                </p>
              )}

              {/* Dedicated Teacher Credentials Badge with Copy */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold">المستخدم:</span>
                    <span className="font-mono font-black text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded-md">
                      {t.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold">الرمز:</span>
                    <span className="font-mono font-black text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded-md">
                      {t.plainPasscode || "teach123"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  title="نسخ بيانات الدخول للمعلم"
                  onClick={() => {
                    const text = `بيانات الدخول لمنظومة المدرسة:\nالمعلم: ${t.fullName}\nاسم المستخدم: ${t.username}\nرمز المرور: ${t.plainPasscode || "teach123"}\nرابط المنظومة: ${window.location.origin}/login`;
                    navigator.clipboard.writeText(text);
                    alert(`✓ تم نسخ بيانات الدخول للأستاذ (${t.fullName})!`);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-sm flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ</span>
                </button>
              </div>

              {/* Monthly Salary Box */}
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-900">الراتب الشهري:</span>
                </div>

                {editingSalaryTeacherId === t.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={salaryInput}
                      onChange={(e) => setSalaryInput(Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900"
                    />
                    <button
                      onClick={() => handleSaveSalary(t.id)}
                      disabled={savingSalary}
                      className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-emerald-950">
                      {Number(t.monthlySalary || 0).toLocaleString()} {currency}
                    </span>
                    <button
                      onClick={() => {
                        setEditingSalaryTeacherId(t.id);
                        setSalaryInput(t.monthlySalary || 0);
                      }}
                      className="text-slate-400 hover:text-emerald-700 p-0.5"
                      title="تعديل الراتب"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Teaching Assignments */}
              <div className="pt-2 border-t border-slate-50 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">التخصيصات والمواد الموكلة:</span>
                <div className="space-y-1.5">
                  {t.teacherAssignments.map((a: any) => (
                    <div
                      key={a.id}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        {a.subject.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {a.classRoom.name} ({a.section.name})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-50">
              🔒 الصلاحيات مقيدة بمواده وصفوفه فقط تلقائياً.
            </div>
          </div>
        ))}
      </div>

      {/* Create Teacher Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="إضافة معلم وتعيين التخصيصات والراتب" maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المعلم الكامل *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أ. أحمد جاسم التميمي"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+9647701234567"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 font-mono text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الشهري ({currency}) *</label>
              <input
                type="number"
                required
                min="0"
                step="25000"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                placeholder="850000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 font-mono text-left"
              />
            </div>
          </div>

          {/* Assignments list */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">تخصيصات المواد والصفوف:</label>
              <button
                type="button"
                onClick={handleAddAssignment}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة تخصيص آخر</span>
              </button>
            </div>

            {assignments.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 relative group"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">المادة</label>
                  <select
                    value={item.subjectId}
                    onChange={(e) => handleAssignmentChange(idx, "subjectId", e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الصف</label>
                  <select
                    value={item.classRoomId}
                    onChange={(e) => handleAssignmentChange(idx, "classRoomId", e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                  >
                    {classRooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الشعبة</label>
                  <div className="flex items-center gap-1">
                    <select
                      value={item.sectionId}
                      onChange={(e) => handleAssignmentChange(idx, "sectionId", e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                    >
                      {sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          شعبة ({sec.name})
                        </option>
                      ))}
                    </select>

                    {assignments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
            >
              {submitting ? "جاري الحفظ..." : "حفظ المعلم وتوليد حسابه"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Created Teacher Notification */}
      {createdResult && (
        <Modal isOpen={!!createdResult} onClose={() => setCreatedResult(null)} title="تم إنشاء حساب المعلم بنجاح!" maxWidth="md">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900">{createdResult.teacher.fullName}</h4>
              <p className="text-xs text-slate-500 mt-0.5">تم توليد بيانات الدخول وتعيين التخصيصات المحددة.</p>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl text-right text-xs space-y-2 font-mono">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-slate-400 font-cairo">اسم المستخدم (5 أحرف):</span>
                <span className="font-bold text-emerald-400 text-sm">{createdResult.username}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-slate-400 font-cairo">رمز المرور (5 أحرف):</span>
                <span className="font-bold text-amber-400 text-sm">{createdResult.rawPassword}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const text = `بيانات الدخول لمنظومة المدرسة:\nالمعلم: ${createdResult.teacher.fullName}\nاسم المستخدم: ${createdResult.username}\nرمز المرور: ${createdResult.rawPassword}\nرابط المنظومة: ${window.location.origin}/login`;
                  navigator.clipboard.writeText(text);
                  alert("✓ تم نسخ بيانات الدخول للمعلم بنجاح!");
                }}
                className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-cairo font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ بيانات الدخول للمعلم</span>
              </button>
            </div>

            <button
              onClick={() => {
                setCreatedResult(null);
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              تم ومتابعة
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <Modal
          isOpen={!!editingTeacher}
          onClose={() => setEditingTeacher(null)}
          title={`تعديل بيانات المعلم: ${editingTeacher.fullName}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-5 font-cairo text-right" dir="rtl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المعلم الكامل *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none focus:border-amber-500 text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الشهري ({currency}) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="25000"
                  value={editMonthlySalary}
                  onChange={(e) => setEditMonthlySalary(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none focus:border-amber-500 text-left"
                />
              </div>
            </div>

            {/* Assignments Selector */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">المواد والصفوف المسندة للمعلم:</label>
                <button
                  type="button"
                  onClick={handleAddEditAssignment}
                  className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إسناد مادة/صف آخر</span>
                </button>
              </div>

              {editAssignments.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">المادة</label>
                    <select
                      value={item.subjectId}
                      onChange={(e) => handleEditAssignmentChange(idx, "subjectId", e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-white outline-none"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الصف</label>
                    <select
                      value={item.classRoomId}
                      onChange={(e) => handleEditAssignmentChange(idx, "classRoomId", e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-white outline-none"
                    >
                      {classRooms.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الشعبة</label>
                    <div className="flex items-center gap-1">
                      <select
                        value={item.sectionId}
                        onChange={(e) => handleEditAssignmentChange(idx, "sectionId", e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-white outline-none"
                      >
                        {sections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            شعبة ({sec.name})
                          </option>
                        ))}
                      </select>

                      {editAssignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditAssignment(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submittingEdit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-md"
              >
                {submittingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>حفظ تعديل بيانات المعلم</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
