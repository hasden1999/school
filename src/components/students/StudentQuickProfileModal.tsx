"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { recordPaymentAction } from "@/app/actions/paymentActions";
import { updateStudentDocumentStatusAction } from "@/app/actions/documentActions";
import { applyTuitionDiscountAction } from "@/app/actions/studentActions";
import {
  User,
  Phone,
  CreditCard,
  FolderLock,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Printer,
  MessageSquare,
  Plus,
  RefreshCw,
  Clock,
  BookOpen,
  FileText,
  Upload,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Copy,
  KeyRound,
  Percent,
} from "lucide-react";

interface StudentQuickProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  currency?: string;
  onOpenReportCard?: (student: any, initialPhase?: string) => void;
  onOpenReceipt?: (receipt: any, student: any) => void;
}

export const StudentQuickProfileModal: React.FC<StudentQuickProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  currency = "د.ع",
  onOpenReportCard,
  onOpenReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<"INFO" | "PAYMENT" | "DOCS" | "GRADES">("INFO");

  // Payment Form state
  const [payAmount, setPayAmount] = useState<number>(250000);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "ZAIN_CASH">("CASH");
  const [payNotes, setPayNotes] = useState<string>("تسديد دفعة من القسط الدراسي");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState<boolean>(true);
  const [paying, setPaying] = useState<boolean>(false);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  // Discount Form state
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [discountReason, setDiscountReason] = useState<string>("خصم إخوة (10%)");
  const [applyingDiscount, setApplyingDiscount] = useState<boolean>(false);
  const [discountSuccess, setDiscountSuccess] = useState<string | null>(null);
  const [isDiscountOpen, setIsDiscountOpen] = useState<boolean>(false);
  const [currentTotalTuition, setCurrentTotalTuition] = useState<number>(student?.totalTuition || 0);

  // Docs state
  const [updatingDocId, setUpdatingDocId] = useState<string | null>(null);
  const [docsList, setDocsList] = useState<any[]>(student?.documents || []);

  if (!isOpen || !student) return null;

  const totalPaid =
    (student.paymentReceipts || []).reduce((sum: number, r: any) => sum + r.amount, 0) +
    (student.depositAmount || 0);
  const remainingTuition = student.totalTuition - totalPaid;

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || payAmount <= 0) return;
    setPaying(true);
    setPaySuccess(null);
    try {
      const res = await recordPaymentAction({
        studentId: student.id,
        amount: Number(payAmount),
        paymentMethod,
        notes: payNotes,
        notifyWhatsApp,
      });

      if (res.success) {
        setPaySuccess(`تم بنجاح تسجيل الدفعة وإصدار الوصل (${res.receiptNumber})!`);
        if (onOpenReceipt && res.receipt) {
          onOpenReceipt(res.receipt, student);
        }
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (res.error) {
        alert(res.error);
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ أثناء تسجيل الدفعة");
    } finally {
      setPaying(false);
    }
  };

  const handleToggleDocStatus = async (
    docId: string,
    newStatus: "MISSING" | "UPLOADED" | "VERIFIED"
  ) => {
    setUpdatingDocId(docId);
    try {
      await updateStudentDocumentStatusAction({
        studentDocId: docId,
        status: newStatus,
        fileUrl: newStatus !== "MISSING" ? "/documents/sample_doc.pdf" : undefined,
      });
      setDocsList((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: newStatus } : d))
      );
    } catch (e: any) {
      alert(e.message || "خطأ أثناء تحديث حالة المستند");
    } finally {
      setUpdatingDocId(null);
    }
  };

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyingDiscount(true);
    setDiscountSuccess(null);

    try {
      let finalDiscountAmount = 0;
      if (discountType === "PERCENT") {
        finalDiscountAmount = Math.round((currentTotalTuition * discountValue) / 100);
      } else {
        finalDiscountAmount = discountValue;
      }

      const newTotal = Math.max(0, currentTotalTuition - finalDiscountAmount);

      const res = await applyTuitionDiscountAction({
        studentId: student.id,
        discountAmount: finalDiscountAmount,
        discountReason,
        newTotalTuition: newTotal,
      });

      if (res?.success) {
        setCurrentTotalTuition(newTotal);
        student.totalTuition = newTotal;
        setDiscountSuccess(
          `✓ تم اعتماد التخفيض بنجاح (${Number(finalDiscountAmount).toLocaleString()} ${currency}) وأصبح القسط الجديد: ${Number(newTotal).toLocaleString()} ${currency}`
        );
        setIsDiscountOpen(false);
      } else if (res?.error) {
        alert(res.error);
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء تطبيق الخصم");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const cleanGuardianPhone = student.guardianPhone?.replace(/[^0-9+]/g, "") || "";
  const waUrl = cleanGuardianPhone
    ? `https://wa.me/${cleanGuardianPhone.replace("+", "")}`
    : "#";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="الملف الشامل والتسديد السريع للطالب"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Student Quick Identity Banner */}
        <div className="bg-slate-50 border border-slate-200 p-5 sm:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center font-bold text-xl shrink-0">
              {student.user.fullName.slice(0, 1)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{student.user.fullName}</h3>
                <Badge variant={student.registrationStatus === "ACTIVE" ? "success" : "neutral"}>
                  {student.registrationStatus === "ACTIVE" ? "مقيد منتظم" : student.registrationStatus}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-2 font-medium">
                <span>{student.classRoom?.name}</span>
                <span>•</span>
                <span>شعبة ({student.section?.name})</span>
                <span>•</span>
                <span className="font-mono text-brand-700">{student.studentNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {cleanGuardianPhone && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>واتساب ولي الأمر</span>
              </a>
            )}

            {onOpenReportCard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportCard(student);
                }}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-slate-300 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>الشهادة</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("INFO")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "INFO"
                ? "bg-brand-50 text-brand-800 border border-brand-100 shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span>بيانات الطالب والاتصال</span>
          </button>

          <button
            onClick={() => setActiveTab("PAYMENT")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "PAYMENT"
                ? "bg-brand-50 text-brand-800 border border-brand-100 shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>تسديد دفعة والأقساط ({Number(remainingTuition).toLocaleString()} متبقي)</span>
          </button>

          <button
            onClick={() => setActiveTab("DOCS")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "DOCS"
                ? "bg-brand-50 text-brand-800 border border-brand-100 shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>المستمسكات والوثائق</span>
          </button>

          <button
            onClick={() => setActiveTab("GRADES")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "GRADES"
                ? "bg-brand-50 text-brand-800 border border-brand-100 shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>ملخص الدرجات الأكاديمية</span>
          </button>
        </div>

        {/* Tab 1: General Info */}
        {activeTab === "INFO" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">اسم ولي الأمر:</span>
                <span className="text-sm font-bold text-slate-900">{student.guardianName}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">رقم هاتف ولي الأمر:</span>
                <span className="text-sm font-bold text-slate-900 font-mono" dir="ltr">
                  {student.guardianPhone}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">تاريخ الميلاد:</span>
                <span className="text-sm font-bold text-slate-900">
                  {student.dateOfBirth || "غير محدد"}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">عنوان السكن:</span>
                <span className="text-sm font-bold text-slate-900">
                  {student.address || "بغداد - الكرخ"}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">تاريخ التسجيل:</span>
                <span className="text-sm font-bold text-slate-900">
                  {new Date(student.createdAt).toLocaleDateString("ar-IQ")}
                </span>
              </div>
            </div>

            {/* Dedicated Credentials Box */}
            <div className="p-5 rounded-xl bg-brand-50 border border-brand-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white text-brand-700 border border-brand-100">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-800">بيانات دخول الطالب للمنظومة</h4>
                    <p className="text-[10px] text-slate-500">حساب خماسي مخصص باللغة الإنجليزية</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const text = `بيانات الدخول لمنظومة المدرسة:\nالطالب: ${student.user?.fullName || student.guardianName}\nاسم المستخدم: ${student.user?.username || "—"}\nرمز المرور: ${student.user?.plainPasscode || "(تم تغييره)"}\nرابط المنظومة: ${typeof window !== "undefined" ? window.location.origin : ""}/login`;
                    navigator.clipboard.writeText(text);
                    alert("✓ تم نسخ بيانات الدخول بنجاح!");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ البيانات</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-0.5">اسم المستخدم (Username):</span>
                  <span className="font-mono text-sm font-bold text-brand-700 tracking-wider">
                    {student.user?.username || "—"}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-0.5">رمز المرور (Passcode):</span>
                  <span className="font-mono text-sm font-bold text-amber-700 tracking-wider">
                    {student.user?.plainPasscode || "••••••"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Financial & Instant Payment */}
        {activeTab === "PAYMENT" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Financial Balance Overview Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">القسط السنوي الكلي</span>
                <span className="text-base font-bold text-slate-900">
                  {Number(student.totalTuition).toLocaleString()} {currency}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-brand-50 border border-brand-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-brand-800 block">المدفوع حتى الآن</span>
                <span className="text-base font-bold text-brand-800">
                  {Number(totalPaid).toLocaleString()} {currency}
                </span>
              </div>

              <div
                className={`p-4 rounded-lg text-center space-y-1 border ${
                  remainingTuition > 0
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-brand-50 border-brand-100 text-brand-800"
                }`}
              >
                <span className="text-[11px] font-bold block">
                  {remainingTuition > 0 ? "المتبقي بذمة الطالب" : "حالة السداد"}
                </span>
                <span className="text-base font-bold">
                  {remainingTuition > 0
                    ? `${Number(remainingTuition).toLocaleString()} ${currency}`
                    : "مسدد بالكامل"}
                </span>
              </div>
            </div>

            {paySuccess && (
              <div className="p-4 rounded-lg bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{paySuccess}</span>
              </div>
            )}

            {discountSuccess && (
              <div className="p-4 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{discountSuccess}</span>
              </div>
            )}

            {/* Tuition Discount & Grants Box (Owner / Principal / Authorized) */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      تخفيض القسط والمنح الدراسية (للمالك والمشرف والمخولين)
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      منح خصم إخوة، أبناء شهداء، تفوق علمي، أو منحة خاصة من الإدارة
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDiscountOpen(!isDiscountOpen)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>{isDiscountOpen ? "إغلاق النموذج" : "تطبيق تخفيض على القسط"}</span>
                </button>
              </div>

              {isDiscountOpen && (
                <form
                  onSubmit={handleApplyDiscount}
                  className="p-4 rounded-lg bg-white border border-amber-200 space-y-3 animate-fadeIn"
                >
                  {/* Preset quick buttons */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">
                      اختيار باقة تخفيض سريعة:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "خصم إخوة 10%", pct: 10, reason: "خصم إخوة (10%)" },
                        { label: "خصم إخوة 15%", pct: 15, reason: "خصم إخوة (15%)" },
                        { label: "خصم تفوق 20%", pct: 20, reason: "خصم تفوق علمي (20%)" },
                        { label: "أبناء شهداء 50%", pct: 50, reason: "منحة أبناء الشهداء (50%)" },
                        { label: "إعفاء كامل 100%", pct: 100, reason: "إعفاء كامل بقرار المالك (100%)" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setDiscountType("PERCENT");
                            setDiscountValue(item.pct);
                            setDiscountReason(item.reason);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">نوع التخفيض:</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                      >
                        <option value="PERCENT">نسبة مئوية (%)</option>
                        <option value="FIXED">مبلغ مقطوع بالدينار</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {discountType === "PERCENT" ? "النسبة المئوية (%):" : `المبلغ المخصوم (${currency}):`}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={discountType === "PERCENT" ? 100 : currentTotalTuition}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">سبب التخفيض / القرار:</label>
                      <input
                        type="text"
                        value={discountReason}
                        onChange={(e) => setDiscountReason(e.target.value)}
                        placeholder="مثال: خصم إخوة، قرار الإدارة..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Summary preview */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">القسط السنوي الحالي:</span>
                      <span className="font-bold text-slate-700">{Number(currentTotalTuition).toLocaleString()} {currency}</span>
                    </div>
                    <span className="text-slate-300 font-bold text-base">⟵</span>
                    <div>
                      <span className="text-slate-500 block text-[11px]">قيمة الخصم:</span>
                      <span className="font-bold text-rose-600">
                        - {discountType === "PERCENT"
                          ? Number(Math.round((currentTotalTuition * discountValue) / 100)).toLocaleString()
                          : Number(discountValue).toLocaleString()}{" "}
                        {currency}
                      </span>
                    </div>
                    <span className="text-slate-300 font-bold text-base">⟵</span>
                    <div>
                      <span className="text-emerald-700 block text-[11px] font-bold">القسط النهائي الجديد:</span>
                      <span className="font-bold text-emerald-800 text-sm">
                        {Number(
                          Math.max(
                            0,
                            currentTotalTuition -
                              (discountType === "PERCENT"
                                ? Math.round((currentTotalTuition * discountValue) / 100)
                                : discountValue)
                          )
                        ).toLocaleString()}{" "}
                        {currency}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsDiscountOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={applyingDiscount}
                      className="px-5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{applyingDiscount ? "جاري الاعتماد..." : "اعتماد وتطبيق الخصم"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Instant Payment Form */}
            {remainingTuition > 0 ? (
              <form
                onSubmit={handleRecordPayment}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4"
              >
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-600" />
                  <span>تسجيل دفعة جديدة وإصدار وصل قبض فوري</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      مبلغ الدفعة ({currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="5000"
                      max={remainingTuition}
                      step="5000"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-bold font-mono text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      طريقة الدفع *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                    >
                      <option value="CASH">نقدي (كاش بالخزينة)</option>
                      <option value="ZAIN_CASH">زين كاش (ZainCash)</option>
                      <option value="BANK_TRANSFER">تحويل مصرفي معتمد</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ملاحظات أو رقم الحوالة
                    </label>
                    <input
                      type="text"
                      value={payNotes}
                      onChange={(e) => setPayNotes(e.target.value)}
                      placeholder="دفعة القسط الثاني..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyWhatsApp}
                      onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-600 w-4 h-4"
                    />
                    <span>إرسال إشعار وصل القبض فورياً لولي الأمر عبر واتساب</span>
                  </label>

                  <button
                    type="submit"
                    disabled={paying}
                    className="px-6 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 disabled:bg-brand-300 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                  >
                    {paying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>تأكيد واستخراج الوصل</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 rounded-xl bg-brand-50 border border-brand-100 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-brand-700 mx-auto" />
                <h4 className="text-sm font-bold text-brand-800">الطالب بريء الذمة المالية بالكامل!</h4>
                <p className="text-xs text-brand-700">تم تسديد كامل القسط السنوي المحدد لهذا العام.</p>
              </div>
            )}

            {/* Past Receipts History */}
            {student.paymentReceipts && student.paymentReceipts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">سجل وصولات القبض السابقة:</h4>
                <div className="space-y-1.5">
                  {student.paymentReceipts.map((rec: any) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{rec.receiptNumber}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{rec.paymentDate}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{rec.notes}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-800">
                          {Number(rec.amount).toLocaleString()} {currency}
                        </span>
                        {onOpenReceipt && (
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(rec, student)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white rounded-md border border-slate-200"
                            title="طباعة الوصل"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Documents Checklist & Status Toggle */}
        {activeTab === "DOCS" && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-xs text-slate-500">
              يمكنك تحديث حالة مستمسكات الطالب مباشرة (مكتملة / ناقصة / قيد التدقيق).
            </p>

            <div className="space-y-2.5">
              {docsList.map((doc: any) => {
                const isUpdating = updatingDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      doc.status === "VERIFIED" || doc.status === "UPLOADED"
                        ? "bg-brand-50/50 border-brand-100"
                        : "bg-rose-50/50 border-rose-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                          doc.status === "VERIFIED" || doc.status === "UPLOADED"
                            ? "bg-brand-100 text-brand-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        <FolderLock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{doc.requirement.title}</h4>
                        <span className="text-[10px] text-slate-500">
                          {doc.requirement.isRequired ? "إلزامي للتسجيل" : "اختياري"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          doc.status === "VERIFIED"
                            ? "bg-brand-700 text-white"
                            : doc.status === "UPLOADED"
                            ? "bg-blue-700 text-white"
                            : "bg-rose-700 text-white"
                        }`}
                      >
                        {doc.status === "VERIFIED"
                          ? "تم التدقيق والتأكيد"
                          : doc.status === "UPLOADED"
                          ? "مرفوع"
                          : "ناقص"}
                      </span>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleDocStatus(doc.id, "VERIFIED")}
                          className="px-2.5 py-1 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px]"
                          title="تحديد كمستند مكتمل ومعتمد"
                        >
                          اعتماد ✓
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleDocStatus(doc.id, "MISSING")}
                          className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px]"
                          title="تحديد كناقص"
                        >
                          ناقص ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Grades Summary */}
        {activeTab === "GRADES" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                كشف درجات المواد للفصول والامتحانات الرسمية:
              </span>
              {onOpenReportCard && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReportCard(student, "month1");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                    title="طباعة كشف درجات اختبار الشهر الأول"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>نتيجة الشهر الأول</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReportCard(student, "midYear");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                    title="طباعة كشف درجات نصف السنة"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>نتيجة نصف السنة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReportCard(student, "FULL");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-sm"
                    title="طباعة الشهادة الرسمية السنوية الكاملة"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>الشهادة الكاملة</span>
                  </button>
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-100 text-slate-900 font-bold">
                  <tr>
                    <th className="p-3 text-right">المادة</th>
                    <th className="p-3">سعي ف1</th>
                    <th className="p-3">نصف السنة</th>
                    <th className="p-3">سعي ف2</th>
                    <th className="p-3 bg-indigo-50 text-indigo-800">السعي السنوي</th>
                    <th className="p-3 bg-brand-50 text-brand-800">النهائي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.gradeRecords && student.gradeRecords.length > 0 ? (
                    student.gradeRecords.map((g: any) => (
                      <tr key={g.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 text-right">
                          {g.subject?.name || "المادة"}
                        </td>
                        <td className="p-3">{g.term1Average ?? "—"}</td>
                        <td className="p-3 font-bold text-blue-900">{g.midYear ?? "—"}</td>
                        <td className="p-3">{g.term2Average ?? "—"}</td>
                        <td className="p-3 font-bold text-indigo-900 bg-indigo-50/50">
                          {g.annualAverage ?? "—"}
                        </td>
                        <td className="p-3 font-bold text-brand-800 bg-brand-50/50">
                          {g.finalGrade ?? "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-slate-500">
                        لا توجد درجات مرصودة لهذا العام حتى الآن.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
