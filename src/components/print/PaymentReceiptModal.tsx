"use client";

import React from "react";
import { Modal } from "../ui/Modal";
import { Printer, Building2, CheckCircle2, DollarSign, Calendar, FileText } from "lucide-react";

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: any;
  student: any;
  schoolName?: string;
  currency?: string;
  tenant?: any;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  student,
  schoolName: initialSchoolName = "ثانوية النخبة الأهلية للبنين",
  currency = "د.ع",
  tenant,
}) => {
  if (!receipt || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const t = tenant || student.tenant;
  const schoolName = t?.name || initialSchoolName;
  const schoolLogo = t?.logo || null;
  const schoolStamp = t?.stampUrl || null;
  const directorName = t?.directorName || "أ. عادل التميمي";
  const footerText = t?.printFooterText || "وصل قبض واستلام مالي رسمي معتمد — صادر من قسم الحسابات";

  // Robust calculation ensuring current receipt is always accounted for
  const deposit = student.depositAmount || 0;
  const receiptsList = [...(student.paymentReceipts || [])];
  const isReceiptInList = receiptsList.some(
    (r: any) => r.id === receipt.id || r.receiptNumber === receipt.receiptNumber
  );

  if (!isReceiptInList && receipt) {
    receiptsList.push(receipt);
  }

  const totalTuition = student.totalTuition || 0;
  const currentReceiptAmount = receipt.amount || 0;
  const totalPaidToDate = receiptsList.reduce((sum: number, r: any) => sum + (r.amount || 0), 0) + deposit;
  const previousPaid = Math.max(0, totalPaidToDate - currentReceiptAmount);
  const remainingBalanceAfterReceipt = Math.max(0, totalTuition - totalPaidToDate);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="وصل قبض واستلام مالي رسمي" maxWidth="lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between no-print bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-600 font-medium">
            وصل مالي رسمي معتمد — يتم خصم المبلغ تلقائياً من المتبقي.
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الوصل المالي</span>
          </button>
        </div>

        {/* Printable Receipt Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-800 print-container shadow-md space-y-5 text-slate-800 font-cairo">
          {/* School & Receipt Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                {schoolLogo ? (
                  <img src={schoolLogo} alt="شعار المدرسة" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{schoolName}</h3>
                <p className="text-xs text-slate-500 font-medium">قسم الشؤون المالية والحسابات</p>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-[10px] text-slate-400 font-sans block font-bold">رقم الوصل التسلسلي</span>
              <span className="font-black text-slate-900 text-base bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                {receipt.receiptNumber}
              </span>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] block font-bold">وصلنا من الطالب / ولي الأمر:</span>
              <span className="font-bold text-slate-900 text-sm">{student.user?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-bold">الصف والشعبة:</span>
              <span className="font-bold text-slate-900">
                {student.classRoom?.name} ({student.section?.name})
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-bold">تاريخ القبض:</span>
              <span className="font-bold text-slate-900 font-mono">{receipt.paymentDate}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-bold">طريقة الدفع:</span>
              <span className="font-bold text-slate-900">
                {receipt.paymentMethod === "CASH"
                  ? "نقداً (صندوق المدرسة)"
                  : receipt.paymentMethod === "ZAIN_CASH"
                  ? "زين كاش / محفظة إلكترونية"
                  : "تحويل / إيداع مصرفي"}
              </span>
            </div>
          </div>

          {/* Current Payment Amount Highlight */}
          <div className="p-5 rounded-3xl bg-emerald-50/80 border-2 border-emerald-300 text-center space-y-1">
            <span className="text-xs text-emerald-800 font-bold block">المبلغ المقبوض بموجب هذا الوصل:</span>
            <div className="text-3xl font-black text-emerald-950 font-mono tracking-wide">
              {Number(currentReceiptAmount).toLocaleString()} <span className="text-base font-sans font-bold">{currency}</span>
            </div>
            {receipt.notes && (
              <p className="text-xs text-emerald-900 pt-1 font-semibold">
                البيان: {receipt.notes}
              </p>
            )}
          </div>

          {/* Financial Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-100 p-2.5 font-bold text-slate-800 border-b border-slate-200 text-center">
              موقف الحساب المالي بعد تنزيل هذه الدفعة
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-200 bg-white">
              <div className="p-3 text-center">
                <span className="text-slate-400 text-[10px] block font-bold">القسط السنوي الكلي</span>
                <span className="font-bold text-slate-900 text-xs">
                  {Number(totalTuition).toLocaleString()} {currency}
                </span>
              </div>
              <div className="p-3 text-center">
                <span className="text-slate-400 text-[10px] block font-bold">المسدد سابقاً</span>
                <span className="font-semibold text-slate-700 text-xs">
                  {Number(previousPaid).toLocaleString()} {currency}
                </span>
              </div>
              <div className="p-3 text-center bg-emerald-50/50">
                <span className="text-emerald-700 text-[10px] block font-bold">المجموع المسدد حتى الآن</span>
                <span className="font-black text-emerald-800 text-xs">
                  {Number(totalPaidToDate).toLocaleString()} {currency}
                </span>
              </div>
              <div className="p-3 text-center bg-rose-50/50">
                <span className="text-rose-700 text-[10px] block font-bold">المتبقي بذمة الطالب</span>
                <span className="font-black text-rose-800 text-sm">
                  {remainingBalanceAfterReceipt > 0
                    ? `${Number(remainingBalanceAfterReceipt).toLocaleString()} ${currency}`
                    : "0 (مسدد بالكامل ✅)"}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-bold">المحاسب المسؤول</p>
              <p className="font-bold text-slate-900">قسم الحسابات والشؤون المالية</p>
              <p className="text-[10px] text-slate-400">التوقيع: .......................................</p>
              <p className="text-[10px] text-slate-500 pt-1">{footerText}</p>
            </div>

            <div className="text-center">
              <div className="h-20 flex items-center justify-center">
                {schoolStamp ? (
                  <img src={schoolStamp} alt="الختم الرسمي" className="h-20 object-contain filter drop-shadow" />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-[10px] text-slate-500 font-bold p-1">
                    <span>ختم الإدارة</span>
                    <span className="text-[8px] text-slate-400">والحسابات</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
