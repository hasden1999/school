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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">التقارير اليومية والواجبات</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            كتابة ملخص الدرس اليومي والواجبات المطلوبة وإرسالها لموافقة الإدارة ونشرها للطلاب.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>كتابة تقرير / واجب يومي جديد</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
            لم تقم برفع أي تقارير بعد. اضغط على الزر أعلاه لإضافة تقرير اليوم.
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{r.subject.name}</h4>
                      <span className="text-[10px] text-slate-400">
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

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-900">{r.title}</h5>
                  <p className="text-slate-600 leading-relaxed">{r.content}</p>
                  {r.homework && (
                    <div className="pt-2 border-t border-slate-200 text-amber-900 font-medium">
                      📖 <span className="font-bold">الواجب البيتي:</span> {r.homework}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">{r.date}</span>
                  <span>
                    {r.status === "APPROVED"
                      ? "✅ مرئي للطالب وولي الأمر"
                      : "🔒 مخفي عن الطالب حتى موافقة الإدارة"}
                  </span>
                </div>

                {r.adminRejectionReason && (
                  <div className="p-3 bg-rose-50 rounded-xl text-rose-700 text-xs border border-rose-100 space-y-1">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المادة والصف *</label>
              <select
                value={selectedAssignmentIndex}
                onChange={(e) => setSelectedAssignmentIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
              >
                {assignments.map((a, i) => (
                  <option key={a.id} value={i}>
                    {a.subject.name} — {a.classRoom.name} ({a.section.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الدرس *</label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">موضوع الدرس الأساسي *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: شرح حل المعادلات الخطية بمتغيرين"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملخص الشرح والموضوع الذي تم إعطاؤه *</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب ملخصاً لما تم شرحه وإنجازه خلال الحصة..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الواجب البيتي المطلوب من الطلاب</label>
            <input
              type="text"
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="مثال: حل تمارين (تأكد من فهمك) رقم 1 إلى 5 صفحة 50 في دفتر الواجبات"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
              {submitting ? "جاري الإرسال..." : "إرسال التقرير لمراجعة الإدارة"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
