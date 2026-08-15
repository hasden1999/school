"use client";

import React, { useState } from "react";
import { createTeacherAction, updateTeacherSalaryAction } from "@/app/actions/teacherActions";
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createdResult, setCreatedResult] = useState<any>(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">الكادر التدريسي والرواتب والتخصيصات</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            إدارة حسابات المعلمين، الرواتب الشهرية، وتعيين تخصيصات المواد والصفوف المقيدة.
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold block">إجمالي المعلمين</span>
              <span className="text-xl font-black text-slate-900">{teachers.length} معلم ومدرس</span>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-800 rounded-xl">
            مخصصون بالجدول
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold block">إجمالي كتلة الرواتب الشهرية</span>
              <span className="text-xl font-black text-emerald-800">
                {Number(totalPayroll).toLocaleString()} {currency}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl">
            شهرياً
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
                <Badge variant={t.active ? "success" : "neutral"}>
                  {t.active ? "نشط" : "معطل"}
                </Badge>
              </div>

              {t.phone && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-mono" dir="ltr">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {t.phone}
                </p>
              )}

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
                <span className="text-slate-400 font-cairo">اسم المستخدم:</span>
                <span className="font-bold text-emerald-400 text-sm">{createdResult.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-cairo">كلمة المرور المؤقتة:</span>
                <span className="font-bold text-emerald-400 text-sm">{createdResult.rawPassword}</span>
              </div>
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
    </div>
  );
};
