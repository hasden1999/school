"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Phone,
  LogOut,
  ExternalLink,
  MessageCircle,
  CreditCard,
  Building2,
  CheckCircle2,
  Send,
  RefreshCw,
  Sparkles,
  Lock,
} from "lucide-react";
import { logoutAction, submitActivationInquiryAction } from "@/app/actions/authActions";

interface SchoolSuspendedViewProps {
  school: {
    name: string;
    code: string;
    subscriptionStatus: string;
    subscriptionPlan?: string;
    trialEndsAt?: Date | string | null;
    subscriptionExpiresAt?: Date | string | null;
    phone?: string | null;
    directorName?: string | null;
  };
  contactInfo?: {
    phone: string;
    whatsapp: string;
    fullName?: string;
  };
}

export const SchoolSuspendedView: React.FC<SchoolSuspendedViewProps> = ({
  school,
  contactInfo = { phone: "07800000000", whatsapp: "9647800000000" },
}) => {
  const isTrial = school.subscriptionStatus === "TRIAL";
  const [submitting, setSubmitting] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // Quick form state
  const [directorPhone, setDirectorPhone] = useState(school.phone || "");
  const [paymentMethod, setPaymentMethod] = useState("ZAIN_CASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Prepare WhatsApp Message
  const cleanPhone = contactInfo.whatsapp.replace(/[^0-9]/g, "");
  const formattedWhatsApp = cleanPhone.startsWith("0")
    ? "964" + cleanPhone.slice(1)
    : cleanPhone.startsWith("964")
    ? cleanPhone
    : "964" + cleanPhone;

  const whatsappMsg = `السلام عليكم ورحمة الله وبركاته،\nأنا مدير مدرسة (${school.name}) - رمز المدرسة: (${school.code}).\nانتهت فترة التجربة المجانية لمدرستنا ونود تفعيل النسخة الرسمية للمنظومة.\nيرجى تزويدنا بتفاصيل التفعيل والاشتراك.`;
  const whatsappUrl = `https://wa.me/${formattedWhatsApp}?text=${encodeURIComponent(whatsappMsg)}`;

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setInquiryError(null);

    try {
      const formData = new FormData();
      formData.append("schoolCode", school.code);
      formData.append("directorName", school.directorName || "مدير المدرسة");
      formData.append("phone", directorPhone);
      formData.append("paymentMethod", paymentMethod);
      formData.append("referenceNumber", referenceNumber);
      formData.append("notes", notes);

      const res = await submitActivationInquiryAction(formData);
      if (res?.error) {
        setInquiryError(res.error);
        setSubmitting(false);
        return;
      }
      setInquirySent(true);
    } catch (err: any) {
      setInquiryError(err?.message || "فشل إرسال الطلب، يرجى التواصل عبر الواتساب مباشرة.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-cairo" dir="rtl">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Top Warning Banner Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border-b border-slate-800 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              {isTrial ? "انتهت فترة التجربة المجانية (14 يوماً)" : "الاشتراك معلق حالياً — مطلوب التجديد"}
            </span>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              لوحة تحويل وتفعيل النسخة الرسمية
            </h1>

            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-300">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{school.name}</span>
              <span className="text-slate-500 font-mono text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {school.code}
              </span>
            </div>
          </div>
        </div>

        {/* Reassurance & Status Information */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>بياناتكم ودرجات طلبتكم في أمان تام 100%</span>
            </div>
            <p className="text-slate-300">
              نود إعلامكم بأن النظام تم إيقافه مؤقتاً لانتهاء فترة الـ 14 يوماً المجانية. جميع سجلات الطلاب، والدرجات الوزارية، والوصولات المالية، والتقارير اليومية محفوظة ومؤمنة في قاعدة البيانات، وستعود للعمل فوراً وبكامل طاقتها بمجرد تفعيل النسخة.
            </p>
          </div>

          {/* Value Props included in Official Activation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-center space-y-1">
              <span className="text-xs font-bold text-amber-400 block">نسخة معتمدة كاملة</span>
              <span className="text-[11px] text-slate-400">بدون أي قيود على عدد الطلاب أو المعلمين</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-400 block">دعم فني وتدريب شامل</span>
              <span className="text-[11px] text-slate-400">مساعدة مستمرة عبر الواتساب والاتصال</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-center space-y-1">
              <span className="text-xs font-bold text-blue-400 block">تحديثات ونسخ احتياطي</span>
              <span className="text-[11px] text-slate-400">حماية سحابية مستمرة لبيانات المدرسة</span>
            </div>
          </div>

          {/* Primary Action: Direct WhatsApp to Platform Owner */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base transition-all shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-200 transition-transform group-hover:scale-110" />
              <span>تواصل مع صاحب المنصة عبر الواتساب لتفعيل النسخة فوراً</span>
              <ExternalLink className="w-4 h-4 opacity-75" />
            </a>

            {/* Direct Phone Call Button */}
            <a
              href={`tel:${contactInfo.phone}`}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>الاتصال الهاتفي المباشر بالدعم: {contactInfo.phone}</span>
            </a>
          </div>

          {/* Payment Methods Info Box */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>طرق السداد المعتمدة لتفعيل النسخة:</span>
              </span>
              <span className="text-[10px] text-slate-400">تفعيل فوري خلال دقائق من الإشعار</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-slate-700/60 border border-slate-600 font-medium">
                محفظة زين كاش (ZainCash)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-700/60 border border-slate-600 font-medium">
                آسيا حوالة (AsiaHawala)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-700/60 border border-slate-600 font-medium">
                حساب مصرفي / ماستركارد
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-700/60 border border-slate-600 font-medium">
                تسليم نقدي مباشر
              </span>
            </div>
          </div>

          {/* Quick Direct Activation Inquiry Form (Optional Accordion) */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            {!showInquiryForm ? (
              <button
                type="button"
                onClick={() => setShowInquiryForm(true)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <span>أو أرسل إشعار السداد وطلب التفعيل إلكترونياً من هنا</span>
              </button>
            ) : inquirySent ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold text-center space-y-1">
                <p>✅ تم إرسال طلب التفعيل بنجاح إلى مالك المنصة!</p>
                <p className="text-[11px] text-emerald-400 font-normal">
                  سيتم مراجعة الطلب وتفعيل النسخة لمدرستكم في أقرب وقت.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700 space-y-3 text-right">
                <span className="text-xs font-bold text-slate-200 block">
                  إرسال إشعار تفعيل إلكتروني مباشر لمالك المنصة:
                </span>

                {inquiryError && (
                  <p className="text-xs text-rose-400 font-bold">{inquiryError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1">
                      رقم هاتف المدير / الواتساب
                    </label>
                    <input
                      type="text"
                      required
                      value={directorPhone}
                      onChange={(e) => setDirectorPhone(e.target.value)}
                      placeholder="0780..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1">
                      طريقة السداد المستخدمة
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="ZAIN_CASH">زين كاش (ZainCash)</option>
                      <option value="ASIA_HAWALA">آسيا حوالة</option>
                      <option value="BANK_TRANSFER">حوالة مصرفية</option>
                      <option value="CASH">دفع نقدي</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">
                    رقم الإشعار / الحوالة أو ملاحظات إضافية
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="رقم العملية أو تفاصيل الحوالة إن وجدت"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>إرسال إشعار التفعيل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            {/* Logout and Return to Login Form */}
            <form action={logoutAction} className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج والعودة لشاشة الدخول الرئيسية</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
