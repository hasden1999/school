"use client";

import React, { useState } from "react";
import { SCHOOL_INFO } from "@/data/schoolActivitiesData";
import {
  GraduationCap,
  X,
  User,
  Phone,
  CheckCircle2,
  Send,
  MessageSquare,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentAdmissionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    studentName: "",
    birthDate: "",
    gender: "ذكر",
    stage: "الأول المتوسط",
    previousSchool: "",
    parentName: "",
    parentPhone: "",
    parentJob: "",
    address: "بغداد",
    notes: "",
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleSendToWhatsApp = () => {
    const message = `*طلب تسجيل طالب جديد في ${SCHOOL_INFO.name}*
----------------------------------------
*اسم الطالب*: ${formData.studentName}
*المواليد*: ${formData.birthDate || "غير محدد"}
*الجنس*: ${formData.gender}
*المرحلة المراد التسجيل فيها*: ${formData.stage}
*المدرسة السابقة*: ${formData.previousSchool || "لا يوجد"}
----------------------------------------
*اسم ولي الأمر*: ${formData.parentName}
*هاتف ولي الأمر*: ${formData.parentPhone}
*وظيفة ولي الأمر*: ${formData.parentJob || "غير محدد"}
*السكن*: ${formData.address}
*ملاحظات*: ${formData.notes || "لا يوجد"}
----------------------------------------
يرجى تأكيد استلام الطلب وتحديد موعد المقابلة واختبار القبول.`;

    const url = `https://wa.me/${SCHOOL_INFO.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-cairo cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-pop space-y-6 text-slate-800 animate-scaleUp my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-700 text-white flex items-center justify-center shadow-pop">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                استمارة تقديم وقبول طالب جديد
              </h3>
              <span className="text-xs text-brand-700 font-bold">
                {SCHOOL_INFO.name} — العام الدراسي {SCHOOL_INFO.activeYear}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* SUCCESS SUBMITTED VIEW */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto border border-brand-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900">
                تم تسجيل بيانات الطالب ({formData.studentName}) بنجاح!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto font-medium">
                تم حفظ بيانات التقديم. لتسريع إجراءات القبول وتحديد موعد المقابلة والاختبار التشخيصي، يمكنك إرسال نسخة من الاستمارة فوراً إلى واتساب إدارة القبول والتسجيل.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-bold shadow-pop transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>إرسال الاستمارة لواتساب الإدارة</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Student Info Group */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>بيانات الطالب:</span>
              </span>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  الاسم الرباعي واللقب للطالب <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="مثال: علي حيدر عباس الكناني"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    المرحلة الدراسية <span className="text-rose-600">*</span>
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 outline-none transition-colors font-bold"
                  >
                    <option value="الأول المتوسط">الأول المتوسط</option>
                    <option value="الثاني المتوسط">الثاني المتوسط</option>
                    <option value="الثالث المتوسط">الثالث المتوسط (وزاري)</option>
                    <option value="الرابع العلمي">الرابع العلمي</option>
                    <option value="الرابع الأدبي">الرابع الأدبي</option>
                    <option value="الخامس العلمي">الخامس العلمي</option>
                    <option value="الخامس الأدبي">الخامس الأدبي</option>
                    <option value="السادس العلمي">السادس العلمي (وزاري)</option>
                    <option value="السادس الأدبي">السادس الأدبي (وزاري)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">سنة التولد</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">الجنس</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 outline-none transition-colors font-bold"
                  >
                    <option value="ذكر">بنين (ذكر)</option>
                    <option value="أنثى">بنات (أنثى)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  المدرسة السابقة (في حال النقل)
                </label>
                <input
                  type="text"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleChange}
                  placeholder="اسم المدرسة السابقة إن وجد"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors font-medium"
                />
              </div>
            </div>

            {/* Parent Info Group */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>بيانات ولي الأمر والتواصل:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    اسم ولي الأمر الكامل <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    required
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="مثال: حيدر عباس الكناني"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    رقم الهاتف / الواتساب <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="parentPhone"
                    required
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="077XXXXXXXX أو 078XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    وظيفة ولي الأمر (اختياري)
                  </label>
                  <input
                    type="text"
                    name="parentJob"
                    value={formData.parentJob}
                    onChange={handleChange}
                    placeholder="مهندس، طبيب، موظف، عمل حر..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">منطقة السكن</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="بغداد - المنصور / الكرخ"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  ملاحظات إضافية أو رغبات خاصة
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="أي معلومات إضافية تود إبلاغ إدارة المدرسة بها..."
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm shadow-pop transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "جاري الإرسال والتسجيل..." : "إرسال طلب القبول والتسجيل"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
