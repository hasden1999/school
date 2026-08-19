"use client";

import React, { useState } from "react";
import {
  updateSchoolSettingsAction,
  syncSchoolCurriculumAction,
  generateSampleStageStudentsAction,
} from "@/app/actions/settingsActions";
import { getPresetForSchoolType } from "@/lib/curriculumPresets";
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
  GraduationCap,
  BookOpen,
  Layers,
  Users,
  UserCheck,
} from "lucide-react";

import { ClassroomsManager } from "@/components/settings/ClassroomsManager";
import { SubjectsManager } from "@/components/settings/SubjectsManager";
import Link from "next/link";

interface SettingsClientProps {
  initialTenant: any;
}

export const SettingsClient: React.FC<SettingsClientProps> = ({
  initialTenant,
}) => {
  const [formData, setFormData] = useState({
    name: initialTenant?.name || "مدرسة المعارف الابتدائية الأهلية",
    logo: initialTenant?.logo || "",
    stampUrl: initialTenant?.stampUrl || "",
    phone: initialTenant?.phone || "+9647701234567",
    email: initialTenant?.email || "info@al-nukhba.iq",
    address: initialTenant?.address || "بغداد - الكرخ - حي الجامعة",
    schoolType: initialTenant?.schoolType || "ابتدائية أهلية",
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

  const [activeTab, setActiveTab] = useState<"CLASSES" | "SUBJECTS" | "BRANDING" | "CONTACT" | "SYSTEM_ADMIN" | "POLICY">("CLASSES");
  const [logoInputMode, setLogoInputMode] = useState<"FILE" | "URL">(
    initialTenant?.logo?.startsWith("data:") ? "FILE" : "URL"
  );
  const [stampInputMode, setStampInputMode] = useState<"FILE" | "URL">(
    initialTenant?.stampUrl?.startsWith("data:") ? "FILE" : "URL"
  );
  const [saving, setSaving] = useState(false);
  const [syncingCurriculum, setSyncingCurriculum] = useState(false);
  const [generatingStudents, setGeneratingStudents] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activePreset = getPresetForSchoolType(formData.schoolType);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "stamp"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    "ابتدائية أهلية",
    "متوسطة (بنين)",
    "متوسطة (بنات)",
    "إعدادية (علمي / أدبي)",
    "ثانوية كاملة (بنين)",
    "ثانوية كاملة (بنات)",
    "مجمع تعليمي شامل (ابتدائي + متوسط + إعدادي)",
    "رياض أطفال وحضانة (تمهيدي)",
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSyncResult(null);
    setErrorMessage(null);

    try {
      const res = await updateSchoolSettingsAction({
        ...formData,
        syncCurriculum: true,
      });
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncCurriculum = async () => {
    setSyncingCurriculum(true);
    setSyncResult(null);
    setErrorMessage(null);

    try {
      const res = await syncSchoolCurriculumAction({
        schoolType: formData.schoolType,
        cleanEmptyOldClasses: true,
        migrateStudents: true,
      });
      if (res.success) {
        setSyncResult(res.message);
        setTimeout(() => setSyncResult(null), 6000);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء مواءمة الصفوف والطلاب");
    } finally {
      setSyncingCurriculum(false);
    }
  };

  const handleGenerateSampleStudents = async () => {
    if (
      !confirm(
        `هل تود توليد وتوزيع طلاب تجريبيين (طالبين لكل صف) على كافة صفوف (${activePreset.stageTitle}) لتجربة المنظومة والدرجات وسجل الطلاب فوراً؟`
      )
    ) {
      return;
    }

    setGeneratingStudents(true);
    setSyncResult(null);
    setErrorMessage(null);

    try {
      const res = await generateSampleStageStudentsAction({ studentsPerClass: 2 });
      if (res.success) {
        setSyncResult(res.message);
        setTimeout(() => setSyncResult(null), 6000);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء توليد الطلاب");
    } finally {
      setGeneratingStudents(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <span>إعدادات وهوية المدرسة ومواءمة المرحلة والطلاب</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تخصيص نوع المدرسة (ابتدائية، متوسطة، إعدادية، ثانوية)، الشعار، والمواءمة التلقائية للصفوف والطلاب والمناهج.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-black transition-all shadow-md"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>حفظ وتطبيق التعديلات</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>تم بنجاح حفظ الإعدادات ومواءمة الصفوف والمناهج وترحيل الطلاب لـ ({activePreset.stageTitle}) في كافة أقسام المنظومة!</span>
        </div>
      )}

      {syncResult && (
        <div className="p-4 rounded-2xl bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
          <Sparkles className="w-5 h-5 shrink-0" />
          <span>{syncResult}</span>
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
            <span>المعاينة الحية للترويسة المعتمدة (Letterhead Live Preview)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            العام الدراسي: {formData.activeYear}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 text-center sm:text-right">
          {/* Right text info */}
          <div className="space-y-1">
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
              {formData.name || "اسم المدرسة"}
            </h2>
            <p className="text-xs text-emerald-400 font-medium">
              {formData.motto || "الشعار اللفظي للمدرسة"}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-300 pt-1">
              <span>{formData.schoolType}</span>
              <span>•</span>
              <span>{formData.address}</span>
              <span>•</span>
              <span className="font-mono">{formData.phone}</span>
            </div>
          </div>

          {/* Center/Left: Logo and Stamp Preview */}
          <div className="flex items-center gap-4">
            {formData.logo ? (
              <div className="w-20 h-20 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg border border-white/20">
                <img
                  src={formData.logo}
                  alt="School Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-[10px] text-slate-400 text-center p-1">
                <ImageIcon className="w-5 h-5 mb-1 text-slate-500" />
                <span>بدون شعار</span>
              </div>
            )}

            {formData.stampUrl ? (
              <div className="w-20 h-20 rounded-2xl bg-white/10 p-2 flex items-center justify-center shadow-lg border border-white/20 relative group">
                <img
                  src={formData.stampUrl}
                  alt="Official Stamp"
                  className="max-h-full max-w-full object-contain filter drop-shadow-md"
                />
                <span className="absolute bottom-1 bg-black/70 text-[8px] px-1.5 py-0.5 rounded text-emerald-300 font-bold">
                  ختم معتمد
                </span>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-[10px] text-slate-400 text-center p-1">
                <Stamp className="w-5 h-5 mb-1 text-slate-500" />
                <span>بدون ختم</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("CLASSES")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "CLASSES"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>الصفوف والشعب الدراسية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SUBJECTS")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "SUBJECTS"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>المواد والمناهج الدراسية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SYSTEM_ADMIN")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "SYSTEM_ADMIN"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>إدارة النظام والنسخ الاحتياطي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("BRANDING")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "BRANDING"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>المرحلة، الهوية والشعار</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CONTACT")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "CONTACT"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>بيانات التواصل والعنوان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("POLICY")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "POLICY"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>السياسات والمطبوعات</span>
        </button>
      </div>

      {/* TAB: CLASSES AND SECTIONS MANAGER */}
      {activeTab === "CLASSES" && (
        <ClassroomsManager
          schoolType={formData.schoolType}
          currency={formData.currency}
        />
      )}

      {/* TAB: SUBJECTS AND CURRICULUM MANAGER */}
      {activeTab === "SUBJECTS" && (
        <SubjectsManager />
      )}

      {/* TAB: SYSTEM ADMIN & ADVANCED TOOLS */}
      {activeTab === "SYSTEM_ADMIN" && (
        <div className="space-y-6 animate-fadeIn font-cairo">
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-2">
            <h3 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>مركز الإدارة المتقدمة وأمان بيانات المدرسة</span>
            </h3>
            <p className="text-xs text-slate-300">
              أدوات الإدارة الحساسة المخصصة لمدير المدرسة: النسخ الاحتياطي الفوري، استعادة قواعد البيانات، ترحيل وإقفال العام الدراسي، وتقييم أداء الكادر التعليمي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Backup & Restore */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 font-bold">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    النسخ الاحتياطي واستعادة البيانات
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    تنزيل نسخة احتياطية مشفرة بصيغة JSON، تحميل حزمة الطوارئ المستقلة (HTML أوفلاين)، واستعادة البيانات بضغطة زر.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/backup"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>فتح مركز النسخ والاستعادة ➔</span>
              </Link>
            </div>

            {/* Card 2: Academic Year Closure */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    إقفال السنة الدراسية وترقية الطلاب
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ترحيل الطلاب الناجحين للصف الأعلى تلقائياً، أرشفة السجلات المالية، وبدء العام الدراسي الجديد بنقرة زر واحدة.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/academic-year"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>فتح إدارة العام الدراسي ➔</span>
              </Link>
            </div>

            {/* Card 3: Teacher Evaluation Exam */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    الامتحان السري وتقييم المعلمين
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    استبيانات تقييم الأداء الأكاديمي، كفاءة الشرح، وانضباط الكادر التعليمي وتقارير الكفاءة السنوية.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/evaluation"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>فتح تقييم المعلمين ➔</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Settings Form Body */}
      <form onSubmit={handleSave} className={`space-y-6 ${activeTab === "CLASSES" || activeTab === "SUBJECTS" || activeTab === "SYSTEM_ADMIN" ? "hidden" : "block"}`}>
        {/* TAB 1: BRANDING & STAGE SYNCHRONIZATION */}
        {activeTab === "BRANDING" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              المرحلة التعليمية، الهوية البصرية، والشعار الرسمي
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
                  placeholder="مثال: مدرسة المعارف الابتدائية الأهلية"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-black text-slate-900 bg-emerald-50/40 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 cursor-pointer"
                >
                  {schoolTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-emerald-600 font-bold">
                  💡 عند تغيير المرحلة (مثلاً: ابتدائية أو متوسطة)، تتكيف الصفوف والمناهج تلقائياً في كافة الأقسام.
                </p>
              </div>

              {/* DYNAMIC STAGE PREVIEW & ACTION BUTTONS */}
              <div className="md:col-span-2 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 p-5 rounded-3xl border border-emerald-500/30 text-white shadow-lg space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                        <span>صفوف ومناهج وطلاب المرحلة:</span>
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {activePreset.stageTitle}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">{activePreset.description}</p>
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* BUTTON 1: STAGE & STUDENTS SYNC */}
                    <button
                      type="button"
                      onClick={handleSyncCurriculum}
                      disabled={syncingCurriculum || generatingStudents}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5"
                    >
                      {syncingCurriculum ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>مواءمة المرحلة ونقل الطلاب 🚀</span>
                    </button>

                    {/* BUTTON 2: GENERATE SAMPLE STUDENTS ACROSS STAGE */}
                    <button
                      type="button"
                      onClick={handleGenerateSampleStudents}
                      disabled={syncingCurriculum || generatingStudents}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50 font-black text-xs transition-all shadow-md flex items-center gap-1.5 border border-teal-400/30"
                    >
                      {generatingStudents ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-teal-200" />
                      )}
                      <span>👥 توليد طلاب تجريبيين للمرحلة</span>
                    </button>
                  </div>
                </div>

                {/* Grid of Planned Classrooms and Subjects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-black text-emerald-400 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>الصفوف الدراسية المقررة ({activePreset.classRooms.length} صفوف):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activePreset.classRooms.map((c) => (
                        <span
                          key={c.code}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-[11px] font-bold"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-black text-teal-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>المواد الدراسية المقررة ({activePreset.subjects.length} مواد):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activePreset.subjects.map((s) => (
                        <span
                          key={s.code}
                          className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
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
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl hover:border-emerald-500 cursor-pointer bg-white transition-all text-center">
                      <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700">اضغط لاختيار صورة الشعار من جهازك</span>
                      <span className="text-[10px] text-slate-400">يدعم صيغ PNG, JPG, JPEG, WEBP, SVG</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "logo")}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/school-logo.png"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-emerald-500 bg-white"
                  />
                )}

                {formData.logo && (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <img src={formData.logo} alt="Logo" className="w-8 h-8 object-contain rounded" />
                      <span className="text-[11px] font-bold text-emerald-800">تم اختيار وتحديد الشعار</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: "" })}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
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
                    <Stamp className="w-4 h-4 text-emerald-600" />
                    <span>الختم الرسمي للمدرسة (Stamp)</span>
                  </label>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setStampInputMode("FILE")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        stampInputMode === "FILE"
                          ? "bg-emerald-600 text-white shadow-sm"
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
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      🔗 رابط إنترنت (URL)
                    </button>
                  </div>
                </div>

                {stampInputMode === "FILE" ? (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl hover:border-emerald-500 cursor-pointer bg-white transition-all text-center">
                      <Stamp className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700">اضغط لاختيار صورة الختم الرسمي الشفاف (PNG)</span>
                      <span className="text-[10px] text-slate-400">يفضل صورة شفافة بخلفية مفرغة للوثائق</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "stamp")}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={formData.stampUrl}
                    onChange={(e) => setFormData({ ...formData, stampUrl: e.target.value })}
                    placeholder="https://example.com/official-stamp.png"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-emerald-500 bg-white"
                  />
                )}

                {formData.stampUrl && (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <img src={formData.stampUrl} alt="Stamp" className="w-8 h-8 object-contain rounded" />
                      <span className="text-[11px] font-bold text-emerald-800">تم اختيار وتحديد الختم الرسمي</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stampUrl: "" })}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      إزالة الختم
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT & ADDRESS */}
        {activeTab === "CONTACT" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              بيانات التواصل والموقع الجغرافي للمدرسة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  اسم المدير المفوض المعتمد للشهادات والوثائق
                </label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  placeholder="مثال: أ. عادل التميمي"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رقم هاتف الإدارة الرسمي / الواتساب
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+964 770 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  البريد الإلكتروني الرسمي للمدرسة
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@school-iq.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  عنوان المدرسة والمحافظة
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="مثال: بغداد - الكرخ - حي الجامعة"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: POLICY, CUTOFFS & PRINT TEXT */}
        {activeTab === "POLICY" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              السياسات الزمنية والمطبوعات الرسمية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  العام الدراسي الفعال
                </label>
                <input
                  type="text"
                  value={formData.activeYear}
                  onChange={(e) => setFormData({ ...formData, activeYear: e.target.value })}
                  placeholder="2024-2025"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  العملة المعتمدة للأقساط
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
                <label className="block text-xs font-bold text-slate-700">
                  ساعة إغلاق طلبات الإجازة الصباحية
                </label>
                <input
                  type="time"
                  value={formData.leaveCutoffTime}
                  onChange={(e) => setFormData({ ...formData, leaveCutoffTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                النص المطبوع أسفل الشهادات والوثائق الرسمية (Footer Disclaimer)
              </label>
              <textarea
                rows={2}
                value={formData.printFooterText}
                onChange={(e) => setFormData({ ...formData, printFooterText: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>يتم تطبيق التعديلات وتحديث القوائم المنسدلة في كافة الأقسام لحظياً.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-black transition-all shadow-lg shadow-emerald-600/20"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ وتطبيق التعديلات الشاملة</span>
          </button>
        </div>
      </form>
    </div>
  );
};
