"use client";

import React, { useState } from "react";
import { PaymentReceiptModal } from "@/components/print/PaymentReceiptModal";
import {
  CreditCard,
  Printer,
  Receipt,
} from "lucide-react";

interface StudentPaymentsClientProps {
  student: any;
  currency: string;
}

export const StudentPaymentsClient: React.FC<StudentPaymentsClientProps> = ({
  student,
  currency,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  if (!student) return null;

  const totalPaid =
    student.paymentReceipts.reduce((sum: number, r: any) => sum + r.amount, 0) +
    student.depositAmount;
  const remaining = student.totalTuition - totalPaid;

  return (
    <div className="space-y-6 text-slate-900 font-cairo animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-surface p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
              <CreditCard className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-brand-700">الحسابات والمالية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">سجل الأقساط والوصولات المالية</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            متابعة الدفعات المسددة، المتبقي من القسط الدراسي، وطباعة الوصولات الرسمية.
          </p>
        </div>
      </div>

      {/* Tuition Summary Card */}
      <div className="card-surface p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-xs text-slate-500 font-semibold block">القسط السنوي الكلي</span>
          <h3 className="text-2xl font-bold text-slate-900 font-mono">{Number(student.totalTuition).toLocaleString()} {currency}</h3>
          <p className="text-[11px] text-slate-500">شامل لكامل العام الدراسي</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-brand-700 font-semibold block">المبلغ المسدد</span>
          <h3 className="text-2xl font-bold text-brand-700 font-mono">{Number(totalPaid).toLocaleString()} {currency}</h3>
          <p className="text-[11px] text-brand-600">يشمل العربون + الدفعات المسجلة</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-rose-700 font-semibold block">المتبقي بذمة الطالب</span>
          <h3 className="text-2xl font-bold text-rose-700 font-mono">
            {remaining > 0 ? `${Number(remaining).toLocaleString()} ${currency}` : "0 (مسدد بالكامل)"}
          </h3>
          <p className="text-[11px] text-slate-500">حسابات شؤون الطلبة</p>
        </div>
      </div>

      {/* Receipts List */}
      <div className="card-surface overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-500 flex items-center justify-between">
          <span>الوصولات وسجل المقبوضات المالية الرسمية ({student.paymentReceipts.length})</span>
        </div>

        <div className="divide-y divide-slate-100">
          {student.paymentReceipts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs font-semibold">
              لا توجد وصولات قبض مسجلة حتى الآن.
            </div>
          ) : (
            student.paymentReceipts.map((r: any) => (
              <div
                key={r.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center font-bold">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 block">{r.receiptNumber}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{r.notes || "دفعة قسط مدرسي"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div className="text-left sm:text-right">
                    <span className="font-bold text-brand-700 text-sm block font-mono">
                      {Number(r.amount).toLocaleString()} {currency}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{r.paymentDate}</span>
                  </div>

                  <button
                    onClick={() => setSelectedReceipt(r)}
                    className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة الوصل</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Printable Modal */}
      {selectedReceipt && (
        <PaymentReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          receipt={selectedReceipt}
          student={student}
          currency={currency}
        />
      )}
    </div>
  );
};
