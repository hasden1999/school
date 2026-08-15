"use client";

import React, { useState } from "react";
import { reviewDailyReportAction } from "@/app/actions/reportActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  MessageSquare,
  BookOpen,
  Calendar,
  User,
  Clock,
} from "lucide-react";

interface ReportsClientProps {
  reports: any[];
}

export const ReportsClient: React.FC<ReportsClientProps> = ({ reports: initialReports }) => {
  const [reports, setReports] = useState<any[]>(initialReports);
  const [filter, setFilter] = useState<string>("PENDING_APPROVAL");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const filteredReports = reports.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const handleApprove = async (reportId: string, notifyWhatsApp = true) => {
    setProcessing(true);
    try {
      await reviewDailyReportAction({
        reportId,
        decision: "APPROVE",
        notifyWhatsApp,
      });
      alert("تمت الموافقة على التقرير وجدولة الإشعار عبر واتساب للطلاب وأولياء الأمور.");
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setProcessing(true);
    try {
      await reviewDailyReportAction({
        reportId: selectedReport.id,
        decision: "REJECT",
        rejectionReason,
      });
      setIsRejectModalOpen(false);
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">التقارير اليومية والواجبات</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تدقيق واعتماد ملخصات الدروس والواجبات المرفوعة من الكادر التدريسي قبل نشرها للطلاب.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-sm">
          <button
            onClick={() => setFilter("PENDING_APPROVAL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filter === "PENDING_APPROVAL"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            بانتظار المراجعة ({reports.filter((r) => r.status === "PENDING_APPROVAL").length})
          </button>
          <button
            onClick={() => setFilter("APPROVED")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filter === "APPROVED" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            المعتمدة
          </button>
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filter === "ALL" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            الكل
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReports.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
            لا توجد تقارير في هذا التبويب حالياً.
          </div>
        ) : (
          filteredReports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{r.subject.name}</span>
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
                      ? "مرفوض"
                      : "قيد المراجعة"}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="text-xs font-black text-slate-900">{r.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.content}</p>
                  {r.homework && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-amber-900 font-medium">
                      📖 <span className="font-bold">الواجب المطلوب:</span> {r.homework}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {r.teacher.fullName}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {r.date}
                  </span>
                </div>

                {r.adminRejectionReason && (
                  <div className="p-2.5 bg-rose-50 rounded-xl text-rose-700 text-xs border border-rose-100">
                    سبب الرفض: {r.adminRejectionReason}
                  </div>
                )}
              </div>

              {/* Admin Actions Bar */}
              {r.status === "PENDING_APPROVAL" && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedReport(r);
                      setIsRejectModalOpen(true);
                    }}
                    disabled={processing}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>رفض للتعديل</span>
                  </button>

                  <button
                    onClick={() => handleApprove(r.id, true)}
                    disabled={processing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>موافقة ونشر + واتساب</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Reason Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="إرجاع التقرير للمعلم للتعديل" maxWidth="md">
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-xs text-slate-600">
            يرجى توضيح سبب الرفض أو الملاحظات المطلوبة ليتمكن المعلم من تصحيح التقرير وإعادة رفعه:
          </p>

          <textarea
            required
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="مثال: يرجى تحديد أرقام تمارين الواجب بدقة وتوضيح موعد التسليم..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-rose-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              تأكيد الرفض
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
