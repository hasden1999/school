"use client";

import React, { useState } from "react";
import { createDailyReportAction } from "@/app/actions/reportActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  FileSpreadsheet,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface TeacherReportsClientProps {
  assignments: any[];
  reports: any[];
}

export const TeacherReportsClient: React.FC<TeacherReportsClientProps> = ({
  assignments,
  reports: initialReports,
}) => {
  const [reports, setReports] = useState<any[]>(initialReports);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [homework, setHomework] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeAssignment = assignments[selectedAssignmentIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;
    setSubmitting(true);
    try {
      const res = await createDailyReportAction({
        classRoomId: activeAssignment.classRoomId,
        sectionId: activeAssignment.sectionId,
        subjectId: activeAssignment.subjectId,
        dateStr,
        title,
        content,
        homework,
      });

      if (res.success) {
        alert("تم إرسال التقرير والواجب بنجاح وهو الآن قيد مراجعة الإدارة.");
        setIsCreateOpen(false);
        window.location.reload();
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 font-cairo animate-fadeIn">
      {/* Header */}
      <div className="card-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-brand-700">سجل النشاط اليومي</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">التقارير اليومية والواجبات</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            كتابة ملخص الدرس اليومي والواجبات المطلوبة وإرسالها لموافقة الإدارة ونشرها للطلاب.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>كتابة تقرير / واجب يومي جديد</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.length === 0 ? (
          <div className="card-surface col-span-2 text-center py-16 text-slate-500 text-xs font-bold">
            لم تقم برفع أي تقارير بعد. اضغط على الزر أعلاه لإضافة تقرير اليوم.
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className="card-surface p-6 space-y-4 hover:border-brand-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
                      <BookOpen className="w-4 h-4 text-brand-700" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{r.subject.name}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {r.classRoom.name} — شعبة ({r.section.name})
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      r.status === "APPROVED"
                        ? "success"
                        : r.status === "REJECTED"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {r.status === "APPROVED"
                      ? "معتمد ومنشور"
                      : r.status === "REJECTED"
                      ? "مرفوض للتعديل"
                      : "بانتظار موافقة الإدارة"}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-900">{r.title}</h5>
                  <p className="text-slate-600 leading-relaxed font-medium">{r.content}</p>
                  {r.homework && (
                    <div className="pt-2 border-t border-slate-100 text-amber-700 font-medium">
                      <span className="font-bold">الواجب البيتي:</span> {r.homework}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">{r.date}</span>
                  <span>
                    {r.status === "APPROVED"
                      ? "مرئي للطالب وولي الأمر"
                      : "مخفي عن الطالب حتى موافقة الإدارة"}
                  </span>
                </div>

                {r.adminRejectionReason && (
                  <div className="p-3 bg-rose-50 rounded-lg text-rose-700 text-xs border border-rose-200 space-y-1">
                    <span className="font-bold block">ملاحظات الإدارة للتعديل:</span>
                    <p>{r.adminRejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="إرسال تقرير وواجب مدرسي يومي" maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-4 font-cairo text-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">المادة والصف *</label>
              <select
                value={selectedAssignmentIndex}
                onChange={(e) => setSelectedAssignmentIndex(Number(e.target.value))}
                className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
              >
                {assignments.map((a, i) => (
                  <option key={a.id} value={i}>
                    {a.subject.name} — {a.classRoom.name} ({a.section.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">تاريخ الدرس *</label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">موضوع الدرس الأساسي *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: شرح حل المعادلات الخطية بمتغيرين"
              className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">ملخص الشرح والموضوع الذي تم إعطاؤه *</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب ملخصاً لما تم شرحه وإنجازه خلال الحصة..."
              className="w-full p-3.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">الواجب البيتي المطلوب من الطلاب</label>
            <input
              type="text"
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="مثال: حل تمارين (تأكد من فهمك) رقم 1 إلى 5 صفحة 50 في دفتر الواجبات"
              className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-md"
            >
              {submitting ? "جاري الإرسال..." : "إرسال التقرير لمراجعة الإدارة"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
