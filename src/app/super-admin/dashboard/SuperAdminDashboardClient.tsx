"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Search,
  ExternalLink,
  PlusCircle,
  TrendingUp,
  LogIn,
  RefreshCw,
  Phone,
  MessageSquare,
  Copy,
  Check,
  School,
  Share2,
} from "lucide-react";
import {
  updateSchoolSubscriptionAction,
  toggleSchoolSuspensionAction,
  impersonateSchoolAdminAction,
  createSchoolDirectlyAction,
  approveAndProvisionSchoolAction,
} from "@/app/actions/superAdminActions";

interface SuperAdminDashboardClientProps {
  data: {
    totalTenants: number;
    activeTenants: number;
    trialTenants: number;
    suspendedTenants: number;
    totalStudents: number;
    totalTeachers: number;
    totalRevenue: number;
    recentPayments: any[];
    allSchools: any[];
    joinRequests?: any[];
  };
}

export const SuperAdminDashboardClient: React.FC<SuperAdminDashboardClientProps> = ({ data }) => {
  const [schools, setSchools] = useState(data.allSchools);
  const [joinRequests, setJoinRequests] = useState(data.joinRequests || []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedSchoolForRenew, setSelectedSchoolForRenew] = useState<any | null>(null);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState<boolean>(false);
  const [provisionedResult, setProvisionedResult] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ type: "SUCCESS" | "ERROR"; text: string } | null>(null);

  // Filtered Schools
  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.directorName && s.directorName.toLowerCase().includes(search.toLowerCase())) ||
      (s.phone && s.phone.includes(search));

    const matchesStatus =
      statusFilter === "ALL" ? true : s.subscriptionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleToggleSuspend = async (school: any) => {
    const isCurrentlySuspended = school.subscriptionStatus === "SUSPENDED";
    const confirmMsg = isCurrentlySuspended
      ? `هل تود إعادة تفعيل مدرسة "${school.name}"؟`
      : `هل أنت متأكد من تجميد وإيقاف وصول مدرسة "${school.name}"؟ لن يتمكن الكادر أو الطلاب من الدخول حتى إعادة التفعيل.`;

    if (!confirm(confirmMsg)) return;

    setLoadingAction(school.id);
    try {
      const res = await toggleSchoolSuspensionAction(school.id, !isCurrentlySuspended);
      if (res?.success) {
        setSchools((prev) =>
          prev.map((item) =>
            item.id === school.id ? { ...item, subscriptionStatus: res.status } : item
          )
        );
        setNotificationMsg({
          type: "SUCCESS",
          text: isCurrentlySuspended ? "تم إعادة تفعيل المدرسة بنجاح" : "تم تجميد المدرسة بنجاح",
        });
      }
    } catch (err: any) {
      setNotificationMsg({ type: "ERROR", text: err.message || "حدث خطأ أثناء العملية" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleImpersonate = async (tenantId: string) => {
    setLoadingAction(tenantId);
    try {
      await impersonateSchoolAdminAction(tenantId);
    } catch (err: any) {
      setNotificationMsg({ type: "ERROR", text: err.message || "حدث خطأ أثناء تسجيل الدخول للمدرسة" });
      setLoadingAction(null);
    }
  };

  const handleApproveJoinRequest = async (request: any) => {
    setLoadingAction(request.id);
    try {
      const res = await approveAndProvisionSchoolAction(request.id);
      if ("tenant" in res) {
        setJoinRequests((prev) =>
          prev.map((item) => (item.id === request.id ? { ...item, status: "PROVISIONED" } : item))
        );
        setProvisionedResult(res);
        setNotificationMsg({
          type: "SUCCESS",
          text: `تم اعتماد وإنشاء مدرسة "${request.schoolName}" وتوليد حساب المدير بنجاح!`,
        });
      } else {
        setNotificationMsg({ type: "ERROR", text: res.error || "فشل إنشاء المدرسة" });
      }
    } catch (err: any) {
      setNotificationMsg({ type: "ERROR", text: err.message || "حدث خطأ غير متوقع" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAddSchoolSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingAction("ADD_SCHOOL");
    const formData = new FormData(e.currentTarget);

    try {
      const res = await createSchoolDirectlyAction(formData);
      if ("tenant" in res) {
        setShowAddSchoolModal(false);
        setProvisionedResult(res);
        setNotificationMsg({
          type: "SUCCESS",
          text: "تم إنشاء المدرسة وتوليد حساب المدير وتجهيز الصفوف والمناهج بنجاح!",
        });
      } else {
        setNotificationMsg({ type: "ERROR", text: res.error || "فشل إنشاء المدرسة" });
      }
    } catch (err: any) {
      setNotificationMsg({ type: "ERROR", text: err.message || "حدث خطأ غير متوقع" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSchoolForRenew) return;

    setLoadingAction("RENEW");
    const formData = new FormData(e.currentTarget);
    formData.set("tenantId", selectedSchoolForRenew.id);

    try {
      const res = await updateSchoolSubscriptionAction(formData);
      if (res?.success) {
        setSchools((prev) =>
          prev.map((item) =>
            item.id === selectedSchoolForRenew.id
              ? {
                  ...item,
                  subscriptionStatus: "ACTIVE",
                  subscriptionPlan: (formData.get("plan") as string) || "PRO",
                  subscriptionExpiresAt: res.newExpiry,
                }
              : item
          )
        );
        setNotificationMsg({
          type: "SUCCESS",
          text: `تم تمديد وتفعيل اشتراك مدرسة "${selectedSchoolForRenew.name}" بنجاح!`,
        });
        setSelectedSchoolForRenew(null);
      } else {
        setNotificationMsg({ type: "ERROR", text: res?.error || "فشل التجديد" });
      }
    } catch (err: any) {
      setNotificationMsg({ type: "ERROR", text: err.message || "حدث خطأ غير متوقع" });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8 font-cairo text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>لوحة القيادة المركزية لمالك المنظومة (SaaS Master Platform)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            إدارة المنظومة والاشتراكات
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            إضافة المدارس المعتمدة، توليد حسابات المدراء، متابعة الاشتراكات والطلبات، وتحصيل الرسوم
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddSchoolModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>➕ إضافة مدرسة جديدة وتوليد حساب المدير</span>
          </button>
        </div>
      </div>

      {/* Global Toast Alert */}
      {notificationMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
            notificationMsg.type === "SUCCESS"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          <span>{notificationMsg.text}</span>
          <button onClick={() => setNotificationMsg(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        
        {/* Total Schools */}
        <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800/80 shadow-lg space-y-2">
          <div className="p-2.5 w-fit rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400">إجمالي المدارس</span>
            <h3 className="text-2xl font-black text-white">{data.totalTenants}</h3>
          </div>
        </div>

        {/* Active Schools */}
        <div className="bg-slate-900/80 p-4 rounded-3xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5 space-y-2">
          <div className="p-2.5 w-fit rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-400">مدارس مفعلة</span>
            <h3 className="text-2xl font-black text-emerald-300">{data.activeTenants}</h3>
          </div>
        </div>

        {/* 14-Day Trial Schools */}
        <div className="bg-slate-900/80 p-4 rounded-3xl border border-amber-500/30 shadow-lg shadow-amber-500/5 space-y-2">
          <div className="p-2.5 w-fit rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-400">تجريبي (14 يوم)</span>
            <h3 className="text-2xl font-black text-amber-300">{data.trialTenants}</h3>
          </div>
        </div>

        {/* Suspended Schools */}
        <div className="bg-slate-900/80 p-4 rounded-3xl border border-rose-500/30 shadow-lg shadow-rose-500/5 space-y-2">
          <div className="p-2.5 w-fit rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-rose-400">مدارس معلقة</span>
            <h3 className="text-2xl font-black text-rose-300">{data.suspendedTenants}</h3>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800/80 shadow-lg space-y-2">
          <div className="p-2.5 w-fit rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400">إجمالي الطلاب</span>
            <h3 className="text-2xl font-black text-white">{data.totalStudents}</h3>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800/80 shadow-lg space-y-2">
          <div className="p-2.5 w-fit rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400">إجمالي الكادر</span>
            <h3 className="text-2xl font-black text-white">{data.totalTeachers}</h3>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900/80 p-4 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 to-emerald-950/40 shadow-lg space-y-2 col-span-2 sm:col-span-3 lg:col-span-1">
          <div className="p-2.5 w-fit rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-300">الإيرادات</span>
            <h3 className="text-2xl font-black text-emerald-400">${data.totalRevenue}</h3>
          </div>
        </div>
      </div>

      {/* PENDING JOIN REQUESTS SECTION */}
      {joinRequests && joinRequests.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 rounded-3xl border border-emerald-500/30 shadow-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  طلبات المدارس الجديدة للانضمام والتجربة ({joinRequests.filter((r) => r.status === "PENDING").length} بانتظار الاعتماد)
                </h3>
                <p className="text-xs text-slate-400">
                  مدراء تواصلوا عبر الموقع لتفعيل مدارسهم وتجربة المنظومة
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {joinRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-white text-xs sm:text-sm">{req.schoolName}</h4>
                    <span className="text-[11px] text-slate-400">
                      👤 {req.directorName} • 📍 {req.province}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === "PROVISIONED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {req.status === "PROVISIONED" ? "تم التفعيل" : "بانتظار الاعتماد"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="font-mono text-slate-300">📱 {req.phone}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${req.phone.replace(/[^0-9]/g, "")}?text=مرحباً أستاذ ${req.directorName}، بخصوص طلب انضمام مدرسة ${req.schoolName} لمنظومة النخبة لإدارة المدارس الأهلية...`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-[11px] transition-colors border border-emerald-500/30"
                    >
                      واتساب
                    </a>
                    {req.status === "PENDING" && (
                      <button
                        type="button"
                        disabled={loadingAction === req.id}
                        onClick={() => handleApproveJoinRequest(req)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] transition-all shadow-md"
                      >
                        {loadingAction === req.id ? "جاري التفعيل..." : "اعتماد وتوليد الحساب 🚀"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schools Directory & Subscription Control Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden space-y-4">
        
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>دليل المدارس والتحكم بالصلاحيات والاشتراكات</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تفعيل، تجميد، تمديد الاشتراكات، والدخول السريع كمدير لتقديم الدعم الفني
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث باسم المدرسة، الكود، المدير..."
                className="w-full pl-4 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-xs font-medium text-white outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 outline-none"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="TRIAL">⏳ فترة تجريبية (14 يوم)</option>
              <option value="ACTIVE">🟢 اشتراك مفعل</option>
              <option value="SUSPENDED">🔴 اشتراك معلق / موقوف</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">المدرسة</th>
                <th className="p-4">المدير والهاتف</th>
                <th className="p-4">الإحصائيات</th>
                <th className="p-4">حالة الاشتراك</th>
                <th className="p-4">الصلاحية وتاريخ الانتهاء</th>
                <th className="p-4 text-center">إجراءات المالك (Super Admin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                    لا توجد مدارس مطابقة لخيارات البحث
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => {
                  const expiry = school.subscriptionExpiresAt
                    ? new Date(school.subscriptionExpiresAt)
                    : school.trialEndsAt
                    ? new Date(school.trialEndsAt)
                    : null;

                  const now = new Date();
                  const diffDays = expiry
                    ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <tr key={school.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* School Name & Code */}
                      <td className="p-4">
                        <div className="font-black text-white text-sm">{school.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {school.code}
                          </span>
                          <span className="text-[10px] text-slate-400">{school.address || "بغداد"}</span>
                        </div>
                      </td>

                      {/* Director & Phone */}
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{school.directorName || "غير محدد"}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {school.phone || "—"}
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            🎓 {school._count?.studentProfiles || 0} طالب
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                            👨‍🏫 {school._count?.users || 0} كادر
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {school.subscriptionStatus === "TRIAL" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>تجريبي 14 يوم</span>
                          </span>
                        )}
                        {school.subscriptionStatus === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>اشتراك مفعل</span>
                          </span>
                        )}
                        {school.subscriptionStatus === "SUSPENDED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>معلق / موقوف</span>
                          </span>
                        )}
                      </td>

                      {/* Expiry & Days */}
                      <td className="p-4">
                        {expiry ? (
                          <div>
                            <div className="font-mono text-slate-200 text-[11px]">
                              {expiry.toISOString().split("T")[0]}
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                diffDays <= 3
                                  ? "text-rose-400"
                                  : diffDays <= 7
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              {diffDays > 0 ? `(متبقي ${diffDays} يوم)` : "(منتهي الصلاحية)"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Renew / Extend Subscription */}
                          <button
                            type="button"
                            onClick={() => setSelectedSchoolForRenew(school)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold transition-all border border-emerald-500/30 flex items-center gap-1"
                            title="تجديد أو تمديد الاشتراك"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>تجديد الاشتراك</span>
                          </button>

                          {/* Toggle Suspend */}
                          <button
                            type="button"
                            disabled={loadingAction === school.id}
                            onClick={() => handleToggleSuspend(school)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                              school.subscriptionStatus === "SUSPENDED"
                                ? "bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30"
                                : "bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30"
                            }`}
                            title={school.subscriptionStatus === "SUSPENDED" ? "تفعيل المدرسة" : "تجميد المدرسة"}
                          >
                            {school.subscriptionStatus === "SUSPENDED" ? "تفعيل" : "تجميد"}
                          </button>

                          {/* Impersonate as School Admin */}
                          <button
                            type="button"
                            disabled={loadingAction === school.id}
                            onClick={() => handleImpersonate(school.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-all border border-slate-700 flex items-center gap-1"
                            title="دخول فوري كمدير لهذه المدرسة لتقديم الدعم الفني"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>دخول كمدير</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SCHOOL MODAL (SUPER ADMIN MANUAL PROVISIONING) */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 animate-scaleUp text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">إضافة مدرسة جديدة وتوليد حساب المدير</h3>
                  <p className="text-xs text-slate-400">سيقوم النظام بإنشاء البيئة وحساب المدير وتجهيز المناهج فوراً</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddSchoolModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchoolSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">اسم المدرسة الأهلية *</label>
                  <input
                    type="text"
                    name="schoolName"
                    required
                    placeholder="مثال: ثانوية المعارف الأهلية"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">كود المدرسة بالإنجليزية (اختياري)</label>
                  <input
                    type="text"
                    name="schoolCode"
                    placeholder="مثال: almaaref (تلقائي إن تُرِك فارغاً)"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-emerald-400 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">اسم المدير الكامل *</label>
                  <input
                    type="text"
                    name="directorName"
                    required
                    placeholder="أستاذ ..."
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">رقم هاتف المدير / الواتساب *</label>
                  <input
                    type="text"
                    name="directorPhone"
                    required
                    placeholder="078XXXXXXXX"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">المحافظة</label>
                  <select
                    name="province"
                    defaultValue="بغداد"
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none"
                  >
                    <option value="بغداد">بغداد</option>
                    <option value="البصرة">البصرة</option>
                    <option value="أربيل">أربيل</option>
                    <option value="النجف الأشرف">النجف الأشرف</option>
                    <option value="كربلاء المقدسة">كربلاء المقدسة</option>
                    <option value="نينوى">الموصل</option>
                    <option value="بابل">بابل</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">نوع التفعيل المبدئي</label>
                  <select
                    name="isTrial"
                    defaultValue="true"
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none"
                  >
                    <option value="true">⏳ تجربة مجانية (14 يوماً)</option>
                    <option value="false">🟢 اشتراك مفعل سنوي (سنة كاملة)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loadingAction === "ADD_SCHOOL"}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {loadingAction === "ADD_SCHOOL" ? "جاري إنشاء المدرسة وتوليد الحساب..." : "إنشاء المدرسة وتوليد بيانات المدير 🚀"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROVISIONED SUCCESS & WHATSAPP SHARE MODAL */}
      {provisionedResult && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 animate-scaleUp text-slate-100">
            <div className="text-center space-y-2 border-b border-slate-800 pb-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">تم إنشاء المدرسة وتوليد حساب المدير بنجاح!</h3>
              <p className="text-xs text-slate-300">{provisionedResult.tenant?.name}</p>
            </div>

            {/* Generated Credentials Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>🏫 كود المدرسة:</span>
                <span className="font-bold text-emerald-400">{provisionedResult.schoolCode}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>👤 اسم مستخدم المدير:</span>
                <span className="font-bold text-white">{provisionedResult.directorUsername}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>🔑 رمز الدخول السري (5 أحرف):</span>
                <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {provisionedResult.directorPassword}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <a
                href={provisionedResult.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>📱 إرسال بيانات الدخول للمدير عبر الواتساب فوراً</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(provisionedResult.welcomeMessage, "MSG")}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                {copiedKey === "MSG" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === "MSG" ? "تم نسخ الرسالة بنجاح!" : "نسخ رسالة الترحيب وبيانات الدخول"}</span>
              </button>

              <button
                type="button"
                onClick={() => setProvisionedResult(null)}
                className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENEW SUBSCRIPTION MODAL */}
      {selectedSchoolForRenew && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 animate-scaleUp text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">تجديد وتمديد اشتراك المدرسة</h3>
                  <p className="text-xs text-slate-400">{selectedSchoolForRenew.name}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSchoolForRenew(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">باقة الاشتراك</label>
                <select
                  name="plan"
                  defaultValue="PRO"
                  className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none"
                >
                  <option value="PRO">الباقة الاحترافية (Pro - شاملة كافة الميزات والواتساب)</option>
                  <option value="BASIC">الباقة الأساسية (Standard - حتى 300 طالب)</option>
                  <option value="CUSTOM">باقة مخصصة (Custom Tier)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">مدة التمديد</label>
                  <select
                    name="durationMonths"
                    defaultValue="12"
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none"
                  >
                    <option value="1">شهر واحد (+1 Month)</option>
                    <option value="3">3 أشهر (+3 Months)</option>
                    <option value="6">6 أشهر (+6 Months)</option>
                    <option value="12">سنة كاملة (+1 Year)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">المبلغ المحصل ($ USD)</label>
                  <input
                    type="number"
                    name="amount"
                    defaultValue="150"
                    step="10"
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">طريقة الاستلام</label>
                  <select
                    name="paymentMethod"
                    defaultValue="ZAIN_CASH"
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none"
                  >
                    <option value="ZAIN_CASH">زين كاش (ZainCash)</option>
                    <option value="ASIA_HAWALA">آسيا حوالة (AsiaHawala)</option>
                    <option value="BANK_TRANSFER">تحويل مصرفي (Bank IBAN)</option>
                    <option value="CASH">استلام نقدي (Cash Handover)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">رقم الإشعار / الحوالة</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    placeholder="مثال: TXN-98421"
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">ملاحظات الفاتورة</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="ملاحظات إضافية على التجديد..."
                  defaultValue="تجديد سنوي معتمد من لوحة مالك المنظومة"
                  className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loadingAction === "RENEW"}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {loadingAction === "RENEW" ? "جاري التجديد والتسجيل..." : "تأكيد تجديد الاشتراك وتحديث الصلاحية 🚀"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSchoolForRenew(null)}
                  className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
