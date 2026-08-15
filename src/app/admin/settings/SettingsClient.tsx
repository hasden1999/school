"use client";

import React, { useState } from "react";
import { updateSchoolSettingsAction } from "@/app/actions/settingsActions";
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Stamp,
  Phone,
  Mail,
  MapPin,
  Clock,
  Coins,
  Calendar,
  FileText,
  ShieldCheck,
  RefreshCw,
  Eye,
} from "lucide-react";

interface SettingsClientProps {
  initialTenant: any;
}

export const SettingsClient: React.FC<SettingsClientProps> = ({
  initialTenant,
}) => {
  const [formData, setFormData] = useState({
    name: initialTenant?.name || "ثانوية النخبة الأهلية للبنين",
    logo: initialTenant?.logo || "",
    stampUrl: initialTenant?.stampUrl || "",
    phone: initialTenant?.phone || "+9647701234567",
    email: initialTenant?.email || "info@al-nukhba.iq",
    address: initialTenant?.address || "بغداد - الكرخ - حي الجامعة",
    schoolType: initialTenant?.schoolType || "ثانوية كاملة (بنين)",
    motto: initialTenant?.motto || "صرحٌ تربويٌ رائد لبناء قادة المستقبل ونخبة الغد",
    directorName: initialTenant?.directorName || "أ. عادل التميمي",
    currency: initialTenant?.currency || "د.ع",
    leaveCutoffTime: initialTenant?.leaveCutoffTime || "08:00",
    attendanceAlertTime: initialTenant?.attendanceAlertTime || "09:00",
    activeYear: initialTenant?.activeYear || "2024-2025",
    printFooterText:
      initialTenant?.printFooterText ||
      "وثيقة رسمية صادرة من إدارة المدرسة — أي كشط أو تحبير يعتبر لاغياً",
  });

  const [activeTab, setActiveTab] = useState<"BRANDING" | "CONTACT" | "POLICY">("BRANDING");
  const [logoInputMode, setLogoInputMode] = useState<"FILE" | "URL">(
    initialTenant?.logo?.startsWith("data:") ? "FILE" : "URL"
  );
  const [stampInputMode, setStampInputMode] = useState<"FILE" | "URL">(
    initialTenant?.stampUrl?.startsWith("data:") ? "FILE" : "URL"
  );
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "stamp"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 3 ميغابايت.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (field === "logo") {
        setFormData((prev) => ({ ...prev, logo: dataUrl }));
      } else {
        setFormData((prev) => ({ ...prev, stampUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const schoolTypes = [
    "ثانوية كاملة (بنين)",
    "ثانوية كاملة (بنات)",
    "إعدادية (علمي / أدبي)",
    "متوسطة (بنين)",
    "متوسطة (بنات)",
    "ابتدائية أهلية",
    "مجمع تعليمي كامل (مختلط)",
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await updateSchoolSettingsAction(formData);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <span>إعدادات وهوية المدرسة</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تخصيص الاسم الرسمي، الشعار، الأختام، بيانات التواصل، والسياسات المعتمدة في الشهادات والوصولات.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-black transition-all shadow-md"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>حفظ التعديلات</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>تم بنجاح حفظ وتحديث إعدادات وهوية المدرسة في كافة صفحات النظام والوثائق المطبوعة!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Preview Letterhead Card */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة الترويسة الرسمية المعتمدة للمدرسة:</span>
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 font-mono text-slate-300 border border-white/10">
            {formData.activeYear}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-2xl shadow-inner shrink-0 overflow-hidden">
              {formData.logo ? (
                <img src={formData.logo} alt="شعار المدرسة" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-white">{formData.name}</h2>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{formData.schoolType}</span>
                <span>•</span>
                <span>{formData.address}</span>
              </p>
              {formData.motto && (
                <p className="text-[11px] text-slate-400 italic">"{formData.motto}"</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-r border-white/10 pt-3 sm:pt-0 sm:pr-6">
            <div className="text-right sm:text-left space-y-1 text-xs text-slate-300">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{formData.phone}</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{formData.email}</span>
              </p>
              <p className="text-[11px] text-emerald-300">
                المدير: <strong>{formData.directorName}</strong>
              </p>
            </div>

            {formData.stampUrl && (
              <div className="w-14 h-14 rounded-full bg-white/10 p-1 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                <img
                  src={formData.stampUrl}
                  alt="الختم الرسمي"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("BRANDING")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "BRANDING"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>الهوية والشعار</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CONTACT")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "CONTACT"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>بيانات التواصل والعنوان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("POLICY")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "POLICY"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4 text-blue-400" />
          <span>السياسات والمطبوعات</span>
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Branding */}
        {activeTab === "BRANDING" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">
              الهوية البصرية والاسم الرسمي للمدرسة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  الاسم الرسمي المعتمد للمدرسة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: ثانوية النخبة الأهلية للبنين"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <p className="text-[11px] text-slate-400">
                  يظهر هذا الاسم في القوائم الجانبية، ترويسة الشهادات، والوصولات المالية.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  المرحلة ونوع المدرسة <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.schoolType}
                  onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-500"
                >
                  {schoolTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  الشعار اللفظي أو الرؤية التربوية (Motto)
                </label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  placeholder="مثال: صرحٌ تربويٌ رائد لبناء قادة المستقبل ونخبة الغد"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Logo Selection: File Upload OR Web URL */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>شعار المدرسة (Logo)</span>
                  </label>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLogoInputMode("FILE")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        logoInputMode === "FILE"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      📂 رفع من الجهاز
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoInputMode("URL")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        logoInputMode === "URL"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      🔗 رابط إنترنت (URL)
                    </button>
                  </div>
                </div>

                {logoInputMode === "FILE" ? (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-white hover:bg-emerald-50/30 cursor-pointer transition-all">
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700">اضغط لاختيار صورة الشعار من جهازك</span>
                      <span className="text-[10px] text-slate-400">يدعم صيغ PNG, JPG, JPEG, WEBP, SVG</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "logo")}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://example.com/school-logo.png"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 bg-white outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400">الصق رابط الصورة المباشر من الإنترنت</p>
                  </div>
                )}

                {/* Logo Preview & Clear */}
                {formData.logo && (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={formData.logo} alt="معاينة الشعار" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">تم اختيار وتحديد الشعار</p>
                        <p className="text-[10px] text-emerald-600 font-bold">جاهز للاعتماد في الشهادات والترويسات</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: "" })}
                      className="text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      إزالة الشعار
                    </button>
                  </div>
                )}
              </div>

              {/* Stamp Selection: File Upload OR Web URL */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Stamp className="w-4 h-4 text-indigo-600" />
                    <span>الختم الرسمي للمدرسة (Stamp)</span>
                  </label>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setStampInputMode("FILE")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        stampInputMode === "FILE"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      📂 رفع من الجهاز
                    </button>
                    <button
                      type="button"
                      onClick={() => setStampInputMode("URL")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        stampInputMode === "URL"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      🔗 رابط إنترنت (URL)
                    </button>
                  </div>
                </div>

                {stampInputMode === "FILE" ? (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl bg-white hover:bg-indigo-50/30 cursor-pointer transition-all">
                      <Stamp className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700">اضغط لاختيار صورة الختم الرسمي من جهازك</span>
                      <span className="text-[10px] text-slate-400">يفضل صورة شفافة PNG للختم الدائري أو البيضاوي</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "stamp")}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={formData.stampUrl}
                      onChange={(e) => setFormData({ ...formData, stampUrl: e.target.value })}
                      placeholder="https://example.com/official-stamp.png"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 bg-white outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400">الصق رابط صورة الختم المباشر من الإنترنت</p>
                  </div>
                )}

                {/* Stamp Preview & Clear */}
                {formData.stampUrl && (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={formData.stampUrl} alt="معاينة الختم" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">تم اختيار وتحديد الختم الرسمي</p>
                        <p className="text-[10px] text-indigo-600 font-bold">يظهر بجانب توقيع المدير في الوثائق المطبوعة</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stampUrl: "" })}
                      className="text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      إزالة الختم
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contact & Location */}
        {activeTab === "CONTACT" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">
              بيانات التواصل والموقع الجغرافي
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>رقم الهاتف المعتمد للمدرسة</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+9647701234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>البريد الإلكتروني الرسمي</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@al-nukhba.iq"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>العنوان والموقع الجغرافي بالتفصيل</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="بغداد - الكرخ - حي الجامعة - مجاور جامع الصديق"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Policy & Printing */}
        {activeTab === "POLICY" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">
              السياسات الأكاديمية ونصوص الوثائق المطبوعة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>العملة المعتمدة للأقساط والوصولات</span>
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-500"
                >
                  <option value="د.ع">دينار عراقي (د.ع)</option>
                  <option value="$">دولار أمريكي ($)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>العام الدراسي الحالي</span>
                </label>
                <input
                  type="text"
                  value={formData.activeYear}
                  onChange={(e) => setFormData({ ...formData, activeYear: e.target.value })}
                  placeholder="2024-2025"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>موعد إغلاق طلبات الإجازة الصباحية</span>
                </label>
                <input
                  type="time"
                  value={formData.leaveCutoffTime}
                  onChange={(e) => setFormData({ ...formData, leaveCutoffTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  الوقت الأقصى لتقديم الإجازة ليتم حسمها قبل بدء الحصة الأولى تلقائياً.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>موعد إنذار عدم رصد الحضور الصباحي</span>
                </label>
                <input
                  type="time"
                  value={formData.attendanceAlertTime}
                  onChange={(e) => setFormData({ ...formData, attendanceAlertTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  اسم مدير المدرسة المعتمد للشهادات والوصولات
                </label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  placeholder="مثال: أ. عادل التميمي"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>نص التذييل الرسمي للوثائق والشهادات المطبوعة</span>
                </label>
                <input
                  type="text"
                  value={formData.printFooterText}
                  onChange={(e) => setFormData({ ...formData, printFooterText: e.target.value })}
                  placeholder="وثيقة رسمية صادرة من إدارة المدرسة — أي كشط أو تحبير يعتبر لاغياً"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-black transition-all shadow-lg"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ واعتماد التعديلات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
