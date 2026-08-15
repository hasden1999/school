"use client";

import React, { useState } from "react";
import { submitStudentLeaveAction } from "@/app/actions/leaveActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface StudentLeavesClientProps {
  leaves: any[];
}

export const StudentLeavesClient: React.FC<StudentLeavesClientProps> = ({
  leaves: initialLeaves,
}) => {
  const [leaves, setLeaves] = useState<any[]>(initialLeaves);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Form
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitStudentLeaveAction({
        startDate,
        endDate,
        reason,
      });

      if (res.success) {
        alert("تم تقديم طلب الإجازة بنجاح، وستتم مراجعته من قبل إدارة المدرسة.");
        setIsSubmitOpen(false);
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">طلبات الإجازة والغياب المبرر</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تقديم طلبات الإجازة الرسمية ومتابعة حالة اعتمادها من قبل إدارة المدرسة.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>تقديم طلب إجازة جديد</span>
        </button>
      </div>

      {/* Leaves Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {leaves.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
            لم تقم بتقديم أي طلبات إجازة سابقة.
          </div>
        ) : (
          leaves.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{l.startDate === l.endDate ? l.startDate : `${l.startDate} إلى ${l.endDate}`}</span>
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
                      ? "موافقة رسمية ✅"
                      : l.status === "REJECTED"
                      ? "طلب مرفوض ❌"
                      : "قيد المراجعة ⏳"}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="text-slate-400 block text-[10px] font-bold mb-0.5">سبب الإجازة:</span>
                  <p className="font-medium">{l.reason}</p>
                </div>

                {l.rejectionReason && (
                  <div className="p-3 bg-rose-50 rounded-xl text-rose-700 text-xs border border-rose-100">
                    سبب الرفض: {l.rejectionReason}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-mono">
                تاريخ التقديم: {new Date(l.createdAt).toLocaleDateString("ar-IQ")}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Leave Modal */}
      <Modal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} title="تقديم طلب إجازة دراسية" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ البدء *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">سبب الإجازة وظروف الغياب *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب طلب الإجازة وظرفك الصحي أو العائلي..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl text-blue-900 text-[11px] leading-relaxed">
            💡 يفضل تقديم الطلب قبل الساعة 8:00 صباحاً من يوم الإجازة لتتمكن الإدارة من حسمه وتسجيلك "مجاز" تلقائياً في كشف الحضور الصباحي.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
            >
              {submitting ? "جاري التقديم..." : "إرسال طلب الإجازة"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
