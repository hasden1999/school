"use client";

import React, { useState } from "react";
import { reviewLeaveRequestAction, trigger8AMLeaveCronAction } from "@/app/actions/leaveActions";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  Phone,
} from "lucide-react";

interface LeavesClientProps {
  leaves: any[];
}

export const LeavesClient: React.FC<LeavesClientProps> = ({ leaves: initialLeaves }) => {
  const [leaves, setLeaves] = useState<any[]>(initialLeaves);
  const [filter, setFilter] = useState<string>("PENDING");
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);
  const [runningCron, setRunningCron] = useState(false);

  const filteredLeaves = leaves.filter((l) => {
    if (filter === "ALL") return true;
    return l.status === filter;
  });

  const handleApprove = async (leaveId: string) => {
    setProcessing(true);
    try {
      await reviewLeaveRequestAction({
        leaveId,
        decision: "APPROVED",
        notifyWhatsApp: true,
      });
      alert("تمت الموافقة وتحديث سجل الحضور وجدولة رسالة واتساب لولي الأمر.");
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ أثناء الموافقة");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setProcessing(true);
    try {
      await reviewLeaveRequestAction({
        leaveId: selectedLeave.id,
        decision: "REJECTED",
        rejectionReason,
        notifyWhatsApp: true,
      });
      setIsRejectOpen(false);
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ أثناء الرفض");
    } finally {
      setProcessing(false);
    }
  };

  const handleRun8AMSync = async () => {
    setRunningCron(true);
    setCronResult(null);
    try {
      const res = await trigger8AMLeaveCronAction();
      setCronResult(res);
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ في المجدول");
    } finally {
      setRunningCron(false);
    }
  };

  return (
    <div className="space-y-6 font-cairo animate-fadeIn">
      {/* Header & 8:00 AM Cron Sync */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-surface p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <CalendarCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-purple-700">إدارة الإجازات المدرسية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">طلبات إجازات الطلاب والكوادر</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            مراجعة طلبات الإجازة مع الحسم الآلي اليومي الساعة 8:00 صباحاً وتحويل حالة الطالب لـ (مجاز).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun8AMSync}
            disabled={runningCron}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
          >
            {runningCron ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span>تشغيل حسم الساعة 8:00 ص الآن</span>
          </button>
        </div>
      </div>

      {/* Logic Callout */}
      <div className="p-4.5 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3.5 text-xs text-purple-800">
        <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <h4 className="font-bold text-purple-800">منطق الحسم الآلي المعتمد (8:00 AM Rule):</h4>
          <p className="text-slate-600 leading-relaxed font-medium">
            يقدم الطالب طلب الإجازة قبل الساعة 8:00 صباحاً. في تمام الساعة 8:00 صباحاً، يقوم المجدول بفحص جميع الطلبات الموافق عليها لليوم، ويقوم آلياً بتعليم الطالب كـ "مجاز" في كشف حضور معلم الحصة الأولى بدون أي تدخل يدوي!
          </p>
        </div>
      </div>

      {cronResult && (
        <div className="p-4 rounded-lg bg-slate-50 text-slate-900 text-xs font-mono border border-brand-100">
          <p className="text-brand-700 font-bold">نتيجة تشغيل مجدول 8:00 ص:</p>
          <p>عدد السجلات التي تم حسمها وتثبيتها بالحضور: {cronResult.processedCount}</p>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-300 text-xs shadow-xs w-fit">
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            filter === "PENDING"
              ? "bg-amber-700 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          قيد الانتظار ({leaves.filter((l) => l.status === "PENDING").length})
        </button>
        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            filter === "APPROVED"
              ? "bg-brand-700 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          المقبولة ({leaves.filter((l) => l.status === "APPROVED").length})
        </button>
        <button
          onClick={() => setFilter("REJECTED")}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            filter === "REJECTED"
              ? "bg-rose-700 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          المرفوضة ({leaves.filter((l) => l.status === "REJECTED").length})
        </button>
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            filter === "ALL"
              ? "bg-indigo-700 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          الكل ({leaves.length})
        </button>
      </div>

      {/* Leaves List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLeaves.length === 0 ? (
          <div className="col-span-3 text-center py-16 card-surface text-slate-500 text-xs font-bold">
            لا توجد طلبات إجازة في هذا القسم.
          </div>
        ) : (
          filteredLeaves.map((l) => (
            <div
              key={l.id}
              className="card-surface p-6 space-y-4 hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                      {l.student.user.fullName.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{l.student.user.fullName}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {l.student.classRoom.name} ({l.student.section.name})
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      l.status === "APPROVED"
                        ? "success"
                        : l.status === "REJECTED"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {l.status === "APPROVED"
                      ? "مقبولة"
                      : l.status === "REJECTED"
                      ? "مرفوضة"
                      : "بانتظار القرار"}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      {l.startDate === l.endDate ? l.startDate : `${l.startDate} إلى ${l.endDate}`}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">السبب: {l.reason}</p>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>ولي الأمر: {l.student.guardianName}</span>
                  <span dir="ltr" className="font-mono text-slate-600 font-bold">
                    {l.student.guardianPhone}
                  </span>
                </div>

                {l.rejectionReason && (
                  <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200 font-medium">
                    سبب الرفض: {l.rejectionReason}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {l.status === "PENDING" && (
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedLeave(l);
                      setIsRejectOpen(true);
                    }}
                    disabled={processing}
                    className="px-3.5 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    رفض الطلب
                  </button>

                  <button
                    onClick={() => handleApprove(l.id)}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    موافقة وتثبيت الإجازة
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="رفض طلب الإجازة" maxWidth="md">
        <form onSubmit={handleReject} className="space-y-4 font-cairo">
          <p className="text-xs text-slate-300 font-medium">يرجى كتابة سبب الرفض ليتم إرساله لولي الأمر عبر واتساب:</p>
          <textarea
            required
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="مثال: تعارض الموعد مع امتحان نصف السنة / عدم إرفاق تقرير طبي..."
            className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-medium outline-none focus:border-rose-500 transition-all"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRejectOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50"
            >
              تأكيد الرفض
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
