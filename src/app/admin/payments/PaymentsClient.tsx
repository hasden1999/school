"use client";

import React, { useState, useEffect } from "react";
import { recordPaymentAction } from "@/app/actions/paymentActions";
import { PaymentRepository } from "@/lib/repositories/PaymentRepository";
import { StudentRepository } from "@/lib/repositories/StudentRepository";
import { runOverdueTuitionReminders } from "@/lib/cronEngine";
import { Modal } from "@/components/ui/Modal";
import { PaymentReceiptModal } from "@/components/print/PaymentReceiptModal";
import {
  CreditCard,
  Plus,
  Printer,
  Search,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  User,
} from "lucide-react";

interface PaymentsClientProps {
  students: any[];
  classRooms: any[];
  currency: string;
  tenant?: any;
}

export const PaymentsClient: React.FC<PaymentsClientProps> = ({
  students: initialStudents,
  classRooms,
  currency,
  tenant,
}) => {
  const [students, setStudents] = useState<any[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<any>(null);

  // Form
  const [amount, setAmount] = useState<number>(250000);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "ZAIN_CASH">("CASH");
  const [notes, setNotes] = useState("دفعة من القسط الدراسي");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [activeReceiptData, setActiveReceiptData] = useState<{ receipt: any; student: any } | null>(null);
  const [sendingOverdue, setSendingOverdue] = useState(false);
  const [overdueResult, setOverdueResult] = useState<any>(null);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.user.fullName.includes(searchTerm) ||
      s.studentNumber.includes(searchTerm) ||
      s.guardianPhone.includes(searchTerm);
    const matchesClass = selectedClass === "ALL" || s.classRoomId === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Load local students if empty on offline mount
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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPay) return;

    const paidAlready =
      (selectedStudentForPay.paymentReceipts?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0) +
      (selectedStudentForPay.depositAmount || 0);
    const maxRemaining = Math.max(0, selectedStudentForPay.totalTuition - paidAlready);

    if (amount <= 0) {
      alert("يرجى إدخال مبلغ دفع صحيح أكبر من الصفر.");
      return;
    }

    if (amount > maxRemaining) {
      alert(`⚠️ لا يمكن إتمام العملية: المبلغ المدخل (${amount.toLocaleString()} ${currency}) يتجاوز المبلغ المتبقي على الطالب (${maxRemaining.toLocaleString()} ${currency}).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await PaymentRepository.createReceipt({
        studentId: selectedStudentForPay.id,
        amount,
        paymentMethod,
        notes,
      });

      if (res.success && res.receipt) {
        const updatedStudent = {
          ...selectedStudentForPay,
          paymentReceipts: [res.receipt, ...(selectedStudentForPay.paymentReceipts || [])],
        };

        setStudents((prev) =>
          prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
        );

        setActiveReceiptData({
          receipt: res.receipt,
          student: updatedStudent,
        });
        setIsRecordOpen(false);
      } else if (res.error) {
        alert(res.error);
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ أثناء تسجيل الدفعة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOverdueReminders = async () => {
    setSendingOverdue(true);
    setOverdueResult(null);
    try {
      const rep = await runOverdueTuitionReminders("al-nukhba");
      setOverdueResult(rep);
    } catch (e: any) {
      alert(e.message || "خطأ أثناء إرسال التذكيرات");
    } finally {
      setSendingOverdue(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">إدارة الأقساط والوصولات المالية</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تسجيل الدفعات، إصدار الوصولات المسلسلة، متابعة المتبقي، وتذكيرات واتساب للمتأخرين.
          </p>
        </div>

        <button
          onClick={handleSendOverdueReminders}
          disabled={sendingOverdue}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md"
        >
          {sendingOverdue ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
          <span>تذكير جماعي عبر واتساب للمتأخرين</span>
        </button>
      </div>

      {overdueResult && (
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono border border-slate-800 space-y-1">
          <p className="text-emerald-400 font-bold">✅ تم تشغيل تذكيرات السداد:</p>
          <p>عدد أولياء الأمور الذين تمت جدولة رسائل لهم: {overdueResult.processedCount}</p>
        </div>
      )}

      {/* Filter Bar with Quick Class Pills */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث سريع باسم الطالب، ولي الأمر، أو الرقم المدرسي..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 bg-slate-50/50"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">الصفوف:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-emerald-500"
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

        {/* Quick Class Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedClass("ALL")}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
              selectedClass === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSel
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
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

      {/* Students Financial Ledger */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-800">
              <tr>
                <th className="p-4">الطالب</th>
                <th className="p-4">الصف والشعبة</th>
                <th className="p-4">القسط السنوي</th>
                <th className="p-4">المسدد الكلي (عربون + دفعات)</th>
                <th className="p-4">المتبقي بذمة الطالب</th>
                <th className="p-4 text-center">إجراءات ودفع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    لا يوجد طلاب مطابقون لمعايير البحث المحددة.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                const totalPaid = s.paymentReceipts.reduce((sum: number, r: any) => sum + r.amount, 0) + s.depositAmount;
                const remaining = s.totalTuition - totalPaid;
                const lastReceipt = s.paymentReceipts[0];

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <span>{s.user.fullName}</span>
                      <span className="block font-mono text-[10px] text-slate-400">{s.studentNumber}</span>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      {s.classRoom.name} ({s.section.name})
                    </td>

                    <td className="p-4 font-bold text-slate-900">
                      {Number(s.totalTuition).toLocaleString()} {currency}
                    </td>

                    <td className="p-4">
                      <span className="font-black text-emerald-700 text-sm">
                        {Number(totalPaid).toLocaleString()} {currency}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {s.paymentReceipts.length} دفعات مسجلة
                      </span>
                    </td>

                    <td className="p-4">
                      {remaining > 0 ? (
                        <span className="font-black text-rose-600 text-sm bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          {Number(remaining).toLocaleString()} {currency}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs">
                          مسدد بالكامل ✅
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {remaining > 0 && (
                          <button
                            onClick={() => {
                              setSelectedStudentForPay(s);
                              setIsRecordOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>استلام دفعة</span>
                          </button>
                        )}

                        {lastReceipt && (
                          <button
                            onClick={() => {
                              setActiveReceiptData({
                                receipt: lastReceipt,
                                student: s,
                              });
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="طباعة آخر وصل استلام"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        title={`قبض دفعة مالية — ${selectedStudentForPay?.user?.fullName}`}
        maxWidth="md"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          {(() => {
            const currentPaid =
              (selectedStudentForPay?.paymentReceipts?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0) +
              (selectedStudentForPay?.depositAmount || 0);
            const currentRem = Math.max(0, (selectedStudentForPay?.totalTuition || 0) - currentPaid);
            const isOver = amount > currentRem;

            return (
              <>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">القسط السنوي:</span>
                    <span className="font-bold text-slate-800">
                      {Number(selectedStudentForPay?.totalTuition).toLocaleString()} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>المتبقي حالياً:</span>
                    <span>
                      {Number(currentRem).toLocaleString()} {currency}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <label className="font-bold text-slate-700">المبلغ المقبوض ({currency}) *</label>
                    <button
                      type="button"
                      onClick={() => setAmount(currentRem)}
                      className="text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      تسديد كامل المتبقي ({Number(currentRem).toLocaleString()} {currency})
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min="1000"
                    max={currentRem}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-black outline-none font-mono ${
                      isOver ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 focus:border-emerald-500 text-slate-900"
                    }`}
                  />
                  {isOver && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1">
                      ⚠️ خطأ: لا يمكن قبول مبلغ أكبر من المتبقي على الطالب ({Number(currentRem).toLocaleString()} {currency}).
                    </p>
                  )}
                </div>
              </>
            );
          })()}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-500 bg-white"
            >
              <option value="CASH">نقداً (صندوق المدرسة)</option>
              <option value="BANK_TRANSFER">إيداع / تحويل مصرفي</option>
              <option value="ZAIN_CASH">زين كاش / آسيا حوالة</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البيان / ملاحظات</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: الدفعة الثانية من القسط السنوي..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={notifyWhatsApp}
              onChange={(e) => setNotifyWhatsApp(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>إرسال إشعار الوصل تلقائياً لولي الأمر عبر واتساب 📲</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRecordOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                amount <= 0 ||
                (selectedStudentForPay &&
                  amount >
                    Math.max(
                      0,
                      (selectedStudentForPay.totalTuition || 0) -
                        ((selectedStudentForPay.paymentReceipts?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0) +
                          (selectedStudentForPay.depositAmount || 0))
                    ))
              }
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>تأكيد وطباعة الوصل</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      {activeReceiptData && (
        <PaymentReceiptModal
          isOpen={!!activeReceiptData}
          onClose={() => {
            setActiveReceiptData(null);
            window.location.reload();
          }}
          receipt={activeReceiptData.receipt}
          student={activeReceiptData.student}
          currency={currency}
          tenant={tenant}
        />
      )}
    </div>
  );
};
