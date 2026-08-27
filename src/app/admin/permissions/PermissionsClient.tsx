"use client";

import React, { useState } from "react";
import {
  ALL_SYSTEM_PERMISSIONS,
  SYSTEM_ROLE_PRESETS,
  SystemPermission,
  getRoleLabel,
  getUserEffectivePermissions,
} from "@/lib/permissions";
import {
  createUserWithPermissionsAction,
  updateUserPermissionsAction,
  resetUserPasswordAction,
  deleteUserAction,
} from "@/app/actions/userManagementActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  Users,
  CreditCard,
  Percent,
  TrendingUp,
  Trash2,
  GraduationCap,
  UserCheck,
  Award,
  Lock,
  FileSpreadsheet,
  CalendarDays,
  Sparkles,
  MessageSquare,
  Building2,
  Settings,
  Plus,
  KeyRound,
  CheckCircle2,
  Search,
  Filter,
  Check,
  X,
  Edit,
  UserPlus,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface PermissionsClientProps {
  users: any[];
  currentUser: any;
}

export const PermissionsClient: React.FC<PermissionsClientProps> = ({
  users: initialUsers,
  currentUser,
}) => {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);

  // Edit User State
  const [editRole, setEditRole] = useState("STAFF");
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editMonthlySalary, setEditMonthlySalary] = useState(0);
  const [selectedPermissions, setSelectedPermissions] = useState<SystemPermission[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Passcode State
  const [newPasscode, setNewPasscode] = useState("");

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isOwnerAdmin = currentUser?.role === "ADMIN";

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Category mapping
  const permissionCategories = [
    { key: "مالي", label: "العمليات المالية وتخفيض الأقساط", icon: CreditCard, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { key: "إداري", label: "شؤون الطلاب والكادر والقبول", icon: GraduationCap, color: "text-blue-700 bg-blue-50 border-blue-200" },
    { key: "أكاديمي", label: "الدرجات والجداول والتقارير اليومية", icon: Award, color: "text-purple-700 bg-purple-50 border-purple-200" },
    { key: "نظام", label: "إعدادات النظام والرسائل والنسخ", icon: Settings, color: "text-slate-700 bg-slate-100 border-slate-200" },
  ];

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditJobTitle(user.jobTitle || "");
    setEditFullName(user.fullName || "");
    setEditPhone(user.phone || "");
    setEditActive(user.active !== false);
    setEditMonthlySalary(user.monthlySalary || 0);

    const effective = getUserEffectivePermissions(user);
    setSelectedPermissions(effective);
    setFeedbackMsg(null);
    setEditModalOpen(true);
  };

  const handleApplyPreset = (presetKey: string) => {
    setEditRole(presetKey);
    const preset = SYSTEM_ROLE_PRESETS[presetKey];
    if (preset) {
      setSelectedPermissions(preset.defaultPermissions);
    }
  };

  const togglePermission = (permId: SystemPermission) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permId)) {
        return prev.filter((p) => p !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setLoadingAction(true);
    setFeedbackMsg(null);

    try {
      const res = await updateUserPermissionsAction(selectedUser.id, {
        role: editRole,
        jobTitle: editJobTitle,
        fullName: editFullName,
        phone: editPhone,
        active: editActive,
        monthlySalary: Number(editMonthlySalary),
        permissions: selectedPermissions,
      });

      if (res?.error) {
        setFeedbackMsg({ type: "error", text: res.error });
      } else if (res?.success && res.user) {
        setUsers((prev) => prev.map((u) => (u.id === res.user.id ? { ...u, ...res.user } : u)));
        setFeedbackMsg({ type: "success", text: "تم حفظ وتحديث الصلاحيات بنجاح!" });
        setTimeout(() => {
          setEditModalOpen(false);
        }, 1200);
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "حدث خطأ غير متوقع أثناء الحفظ" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingAction(true);
    setFeedbackMsg(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("permissions", JSON.stringify(selectedPermissions));
      const res = await createUserWithPermissionsAction(formData);

      if (res?.error) {
        setFeedbackMsg({ type: "error", text: res.error });
      } else if (res?.success && res.user) {
        setUsers((prev) => [res.user, ...prev]);
        setCreateModalOpen(false);
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "فشل إنشاء المستخدم" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPasscode) return;
    setLoadingAction(true);
    try {
      const res = await resetUserPasswordAction(selectedUser.id, newPasscode);
      if (res?.success) {
        setResetPassModalOpen(false);
        setNewPasscode("");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-8 font-cairo">
      {/* Header Banner */}
      <div className="card-surface p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>مركز السيادة والتحكم الإداري والمالي الشامل</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            إدارة الصلاحيات والمستخدمين والأدوار المخصصة
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            التحكم المطلق للمالك والمدير العام في منح وتعديل صلاحيات الموظفين، تقييد العمليات المالية وتخفيض الأقساط، وتعيين الأدوار الوظيفية بدقة.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedPermissions(SYSTEM_ROLE_PRESETS.STAFF.defaultPermissions);
            setFeedbackMsg(null);
            setCreateModalOpen(true);
          }}
          className="px-5 py-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition-all flex items-center gap-2 shrink-0 shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة موظف / كادر جديد</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5 space-y-1">
          <span className="text-xs font-bold text-slate-500 block">إجمالي المستخدمين المسجلين</span>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{users.length}</p>
        </div>
        <div className="card-surface p-5 space-y-1">
          <span className="text-xs font-bold text-slate-500 block">صلاحيات مالية وتخفيض الأقساط</span>
          <p className="text-2xl font-bold text-emerald-700 tabular-nums">
            {users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN" || getUserEffectivePermissions(u).includes("MANAGE_DISCOUNTS")).length}
          </p>
        </div>
        <div className="card-surface p-5 space-y-1">
          <span className="text-xs font-bold text-slate-500 block">الهيئة التدريسية والأكاديمية</span>
          <p className="text-2xl font-bold text-purple-700 tabular-nums">
            {users.filter((u) => u.role === "TEACHER").length}
          </p>
        </div>
        <div className="card-surface p-5 space-y-1">
          <span className="text-xs font-bold text-slate-500 block">الكادر الإداري والمحاسبي</span>
          <p className="text-2xl font-bold text-blue-700 tabular-nums">
            {users.filter((u) => ["ADMIN", "VICE_PRINCIPAL", "ACCOUNTANT", "STAFF", "CUSTOM"].includes(u.role)).length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، اسم المستخدم، الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: "كافة المستخدمين" },
            { key: "ADMIN", label: "المدير العام" },
            { key: "VICE_PRINCIPAL", label: "المعاونون" },
            { key: "ACCOUNTANT", label: "المحاسبون" },
            { key: "STAFF", label: "الإداريون" },
            { key: "TEACHER", label: "المدرسون" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                roleFilter === tab.key
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="text-right">المستخدم والاسم الكامل</th>
                <th className="text-center">الدور والرتبة</th>
                <th className="text-center">اسم المستخدم (Login)</th>
                <th className="text-center">رقم الهاتف</th>
                <th className="text-center">حجم الصلاحيات الممنوحة</th>
                <th className="text-center">الحالة</th>
                <th className="text-center">الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const perms = getUserEffectivePermissions(u);
                const hasFinancial = perms.includes("MANAGE_PAYMENTS") || perms.includes("MANAGE_DISCOUNTS");
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                            {u.fullName}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {u.jobTitle || getRoleLabel(u.role)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="text-center">
                      <Badge variant={u.role === "ADMIN" ? "success" : u.role === "ACCOUNTANT" ? "info" : "neutral"}>
                        {getRoleLabel(u.role)}
                      </Badge>
                    </td>

                    <td className="text-center">
                      <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {u.username}
                      </span>
                    </td>

                    <td className="text-center">
                      <span className="font-mono text-xs text-slate-600" dir="ltr">
                        {u.phone || "—"}
                      </span>
                    </td>

                    <td className="text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                          {perms.length} صلاحية
                        </span>
                        {hasFinancial && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            مالي 💰
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="text-center">
                      {u.active !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>نشط</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-bold">
                          <X className="w-3.5 h-3.5" />
                          <span>معطل</span>
                        </span>
                      )}
                    </td>

                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200 flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>تعديل الصلاحيات</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setNewPasscode("");
                            setResetPassModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors cursor-pointer"
                          title="إعادة تعيين كلمة المرور"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Granular Permission Editor Modal */}
      {editModalOpen && selectedUser && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`تخصيص وإدارة صلاحيات المستخدم: ${selectedUser.fullName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 font-cairo">
            {feedbackMsg && (
              <div
                className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                  feedbackMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* User Details Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">المسمى الوظيفي:</label>
                <input
                  type="text"
                  value={editJobTitle}
                  onChange={(e) => setEditJobTitle(e.target.value)}
                  placeholder="مثال: مسؤول شؤون الطلبة"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Quick Role Preset Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                تطبيق قالب صلاحيات سريع (Preset Roles):
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SYSTEM_ROLE_PRESETS)
                  .filter(([k]) => isSuperAdmin || k !== "SUPER_ADMIN")
                  .map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleApplyPreset(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        editRole === key
                          ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Granular Permission Checkboxes Grouped by Category */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  قائمة الصلاحيات التفصيلية الممنوحة ({selectedPermissions.length} من {ALL_SYSTEM_PERMISSIONS.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions(ALL_SYSTEM_PERMISSIONS.map((p) => p.id))}
                    className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    تحديد الكل
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([])}
                    className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                  >
                    إلغاء الكل
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {permissionCategories.map((cat) => {
                  const catPerms = ALL_SYSTEM_PERMISSIONS.filter((p) => p.category === cat.key);
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                        <Icon className="w-4 h-4 text-emerald-800" />
                        <span className="text-xs font-bold text-slate-800">{cat.label}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catPerms.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? "bg-emerald-50/70 border-emerald-300 text-slate-900"
                                  : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/60"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-bold block leading-snug">
                                  {perm.label}
                                </span>
                                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                                  {perm.description}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="rounded text-emerald-700"
                  />
                  <span>الحساب مفعّل ونشط</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={loadingAction}
                  onClick={handleSavePermissions}
                  className="px-6 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{loadingAction ? "جاري الحفظ..." : "حفظ واعتماد الصلاحيات"}</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create New User Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="إضافة موظف أو كادر جديد وتعيين صلاحياته"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 font-cairo">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الاسم الكامل الرباعي *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="مثال: أحمد عبد الحسين الكناني"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المستخدم للدخول *</label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="مثال: ahmed_admin"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">كلمة المرور الأولية *</label>
                <input
                  type="text"
                  name="password"
                  required
                  defaultValue="staff123"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  name="jobTitle"
                  placeholder="مثال: مسؤول الشؤون المالية"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+964..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الدور الوظيفي الأساسي</label>
                <select
                  name="role"
                  defaultValue="STAFF"
                  onChange={(e) => {
                    const preset = SYSTEM_ROLE_PRESETS[e.target.value];
                    if (preset) setSelectedPermissions(preset.defaultPermissions);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                >
                  <option value="STAFF">موظف إداري / شؤون طلبة</option>
                  <option value="ACCOUNTANT">محاسب مالي / أمين صندوق</option>
                  <option value="VICE_PRINCIPAL">معاون مدير</option>
                  <option value="SUPERVISOR">مشرف تربوي</option>
                  <option value="TEACHER">معلم / مدرس</option>
                  <option value="CUSTOM">دور مخصص (Custom)</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
              سيتم تفعيل الصلاحيات الافتراضية تلقائياً بحسب الدور المختار ويمكنك تخصيصها وتعديلها في أي وقت.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loadingAction}
                className="px-6 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs"
              >
                {loadingAction ? "جاري الإنشاء..." : "إنشاء المستخدم"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetPassModalOpen && selectedUser && (
        <Modal
          isOpen={resetPassModalOpen}
          onClose={() => setResetPassModalOpen(false)}
          title={`إعادة تعيين كلمة المرور: ${selectedUser.fullName}`}
          maxWidth="sm"
        >
          <div className="space-y-4 font-cairo">
            <p className="text-xs text-slate-600 leading-relaxed">
              أدخل كلمة المرور الجديدة للمستخدم ({selectedUser.username}). سيتمكن المستخدم من تسجيل الدخول بها مباشرة.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الجديدة:</label>
              <input
                type="text"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-sm"
                dir="ltr"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setResetPassModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!newPasscode || loadingAction}
                onClick={handleResetPassword}
                className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs disabled:opacity-50"
              >
                {loadingAction ? "جاري الحفظ..." : "تأكيد وتغيير الرمز"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
