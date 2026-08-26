"use client";

import React, { useState, useMemo } from "react";
import {
  ALL_SYSTEM_PERMISSIONS,
  SYSTEM_ROLE_PRESETS,
  SystemPermission,
  getUserEffectivePermissions,
  getRoleLabel,
} from "@/lib/permissions";
import {
  createUserWithPermissionsAction,
  updateUserPermissionsAction,
  resetUserPasswordAction,
  deleteUserAction,
} from "@/app/actions/userManagementActions";
import {
  ShieldCheck,
  Users,
  UserPlus,
  Edit,
  Key,
  Trash2,
  Search,
  Building2,
  CheckCircle2,
  X,
  Sparkles,
  Lock,
  User,
  Phone,
  AlertCircle,
  Briefcase,
  ChevronDown,
  Layers,
  Crown,
  GraduationCap,
  Award,
  CreditCard,
  Settings,
  CalendarDays,
  FileSpreadsheet,
  MessageSquare,
  Eye,
  Copy,
} from "lucide-react";

interface Props {
  initialUsers: any[];
  tenants: any[];
}

const ROLE_CHIP_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-amber-100 text-amber-700",
  ADMIN: "bg-brand-50 text-brand-700",
  VICE_PRINCIPAL: "bg-blue-50 text-blue-700",
  ACCOUNTANT: "bg-indigo-50 text-indigo-700",
  STAFF: "bg-teal-50 text-teal-700",
  SUPERVISOR: "bg-violet-50 text-violet-700",
  TEACHER: "bg-sky-50 text-sky-700",
  STUDENT: "bg-orange-50 text-orange-700",
  CUSTOM: "bg-fuchsia-50 text-fuchsia-700",
};

export const SuperAdminRolesClient: React.FC<Props> = ({
  initialUsers,
  tenants,
}) => {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<any | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState<string>("");

  // Feedback states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit/Create form state
  const [formRole, setFormRole] = useState<string>("STAFF");
  const [formJobTitle, setFormJobTitle] = useState<string>("");
  const [formPermissions, setFormPermissions] = useState<SystemPermission[]>([]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchTenant =
        tenantFilter === "all" || u.tenantId === tenantFilter;
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchSearch =
        !searchQuery.trim() ||
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.tenant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTenant && matchRole && matchSearch;
    });
  }, [users, tenantFilter, roleFilter, searchQuery]);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOpenEditModal = (user: any) => {
    setEditingUser(user);
    setFormRole(user.role);
    setFormJobTitle(user.jobTitle || "");
    setFormPermissions(getUserEffectivePermissions(user));
    setError(null);
  };

  const handleRolePresetChange = (selectedRole: string) => {
    setFormRole(selectedRole);
    if (SYSTEM_ROLE_PRESETS[selectedRole]) {
      setFormPermissions(SYSTEM_ROLE_PRESETS[selectedRole].defaultPermissions);
    }
  };

  const togglePermission = (permId: SystemPermission) => {
    if (formPermissions.includes(permId)) {
      setFormPermissions(formPermissions.filter((p) => p !== permId));
    } else {
      setFormPermissions([...formPermissions, permId]);
    }
  };

  const handleSelectAllPermissions = () => {
    setFormPermissions(ALL_SYSTEM_PERMISSIONS.map((p) => p.id));
  };

  const handleDeselectAllPermissions = () => {
    setFormPermissions([]);
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError(null);

    try {
      const res = await updateUserPermissionsAction(editingUser.id, {
        role: formRole,
        jobTitle: formJobTitle,
        permissions: formPermissions,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? res.user : u))
        );
        setEditingUser(null);
        showToast("تم تحديث وتخصيص صلاحيات المستخدم بنجاح!");
      }
    } catch {
      setError("حدث خطأ أثناء حفظ الصلاحيات");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("role", formRole);
      formData.set("jobTitle", formJobTitle);
      formData.set("permissions", JSON.stringify(formPermissions));

      const res = await createUserWithPermissionsAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setUsers((prev) => [res.user, ...prev]);
        setShowCreateModal(false);
        showToast("تم إنشاء المستخدم وتعيين صلاحياته بنجاح!");
      }
    } catch {
      setError("حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser || !newPasswordValue.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await resetUserPasswordAction(
        passwordResetUser.id,
        newPasswordValue.trim()
      );
      if (res.error) {
        setError(res.error);
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === passwordResetUser.id
              ? { ...u, plainPasscode: newPasswordValue.trim() }
              : u
          )
        );
        setPasswordResetUser(null);
        setNewPasswordValue("");
        showToast("تم تعيين كلمة المرور الجديدة بنجاح!");
      }
    } catch {
      setError("حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك بحذف المستخدم (${name}) نهائياً؟`)) {
      return;
    }

    try {
      const res = await deleteUserAction(userId);
      if (res.error) {
        alert(res.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast("تم حذف المستخدم بنجاح");
      }
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-surface p-6">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-lg bg-brand-700 text-white flex items-center justify-center shadow-pop">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>إدارة الأدوار ومصفوفة الصلاحيات المركزية</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                Super Admin Master
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              تحكم سيادي كامل: إضافة مستخدمين (مدير، معاون، محاسب، موظف إداري، معلم...) وتعديل وتخصيص صلاحيات أي مستخدم بما في ذلك مدير المدرسة.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            setFormRole("STAFF");
            setFormJobTitle("");
            setFormPermissions(SYSTEM_ROLE_PRESETS["STAFF"].defaultPermissions);
            setError(null);
          }}
          className="px-6 py-3.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-bold shadow-pop transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          <span>إضافة مستخدم / موظف جديد</span>
        </button>
      </div>

      {/* Toast */}
      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-lg bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-pop flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 card-surface p-4 sm:p-5">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، اسم المستخدم، المدرسة، المسمى الوظيفي..."
            className="w-full pl-4 pr-11 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors text-xs sm:text-sm font-medium"
          />
          <Search className="w-5 h-5 text-brand-700 absolute right-3.5 top-3" />
        </div>

        {/* Tenant Filter */}
        <div className="sm:col-span-3">
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 text-xs font-bold outline-none transition-colors"
          >
            <option value="all">جميع المدارس ({tenants.length})</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 text-xs font-bold outline-none transition-colors"
          >
            <option value="all">كافة الأدوار والرتب</option>
            <option value="ADMIN">مدير المدرسة</option>
            <option value="VICE_PRINCIPAL">معاون المدير</option>
            <option value="ACCOUNTANT">محاسب مالي</option>
            <option value="STAFF">موظف إداري</option>
            <option value="SUPERVISOR">مشرف تربوي</option>
            <option value="TEACHER">معلم / مدرس</option>
            <option value="STUDENT">طالب</option>
            <option value="SUPER_ADMIN">مالك المنظومة</option>
          </select>
        </div>
      </div>

      {/* Users List Table */}
      <div className="card-surface overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-700" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              قائمة المستخدمين والموظفين ({filteredUsers.length})
            </h3>
          </div>

          <span className="text-xs text-slate-500">
            اضغط على (تعديل الصلاحيات) للتحكم الدقيق بصلاحيات أي حساب
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">المدرسة</th>
                <th className="p-4">الدور والمسمى الوظيفي</th>
                <th className="p-4">رمز الدخول السريع</th>
                <th className="p-4">الصلاحيات الممنوحة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((user) => {
                const userPermissions = getUserEffectivePermissions(user);

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-100">
                          {user.role === "SUPER_ADMIN" ? <Crown className="w-4 h-4 text-amber-500" /> : user.fullName?.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                            {user.fullName}
                          </span>
                          <span className="text-[11px] text-brand-700 font-mono">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* School */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 inline-flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-brand-700" />
                        <span>{user.tenant?.name || "منظومة مركزية"}</span>
                      </span>
                    </td>

                    {/* Role and Job Title */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            ROLE_CHIP_STYLES[user.role] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                        {user.jobTitle && (
                          <span className="text-[11px] text-slate-500 block font-medium">
                            {user.jobTitle}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Passcode Copy */}
                    <td className="p-4">
                      {user.plainPasscode ? (
                        <button
                          onClick={() => handleCopyCode(user.id, user.plainPasscode)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-[11px] font-mono text-brand-700 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="نسخ رمز الدخول"
                        >
                          <span>{user.plainPasscode}</span>
                          <Copy className="w-3 h-3 text-slate-400" />
                          {copiedId === user.id && (
                            <span className="text-[9px] text-brand-700">تم!</span>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">مشفرة</span>
                      )}
                    </td>

                    {/* Permissions summary */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-100 text-[10px] font-bold">
                          {userPermissions.length} / {ALL_SYSTEM_PERMISSIONS.length} صلاحية
                        </span>
                        {user.isCustomPermissions && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold">
                            تخصيص مخصص
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-100 text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل الصلاحيات</span>
                        </button>

                        <button
                          onClick={() => {
                            setPasswordResetUser(user);
                            setNewPasswordValue("");
                            setError(null);
                          }}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 cursor-pointer"
                          title="تغيير كلمة المرور"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        {user.role !== "SUPER_ADMIN" && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-all cursor-pointer"
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PERMISSIONS MODAL */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="card-surface shadow-pop p-6 sm:p-8 max-w-2xl w-full space-y-6 text-slate-900 animate-scaleUp my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-brand-700 text-white flex items-center justify-center shadow-pop">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    تخصيص صلاحيات المستخدم: {editingUser.fullName}
                  </h3>
                  <span className="text-xs text-brand-700 font-mono">
                    @{editingUser.username} ({editingUser.tenant?.name})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSavePermissions} className="space-y-6 text-xs sm:text-sm">
              {/* Role & Preset Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    الرتبة والدور الأساسي
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRolePresetChange(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 font-bold outline-none transition-colors"
                  >
                    <option value="ADMIN">مدير المدرسة (إدارة كاملة)</option>
                    <option value="VICE_PRINCIPAL">معاون المدير / المشرف الإداري</option>
                    <option value="ACCOUNTANT">محاسب مالي / أمين الصندوق</option>
                    <option value="STAFF">موظف إداري / شؤون الطلبة</option>
                    <option value="SUPERVISOR">مشرف تربوي / أكاديمي</option>
                    <option value="TEACHER">معلم / مدرس</option>
                    <option value="CUSTOM">دور مخصص يدوياً</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    المسمى الوظيفي المخصص (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder="مثال: مسؤول الشؤون المالية، معاون المدير"
                    className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Granular Permission Checkbox Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-700" />
                    <span>مصفوفة الصلاحيات الدقيقة ({formPermissions.length}/{ALL_SYSTEM_PERMISSIONS.length})</span>
                  </h4>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllPermissions}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                    >
                      إلغاء الكل
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                  {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                    const isChecked = formPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                          isChecked
                            ? "bg-brand-50 border-brand-600 text-slate-900"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 mt-1 cursor-pointer"
                        />
                        <div className="space-y-0.5 flex-1">
                          <span className="font-bold text-xs block text-slate-900">
                            {perm.label}
                          </span>
                          <span className="text-[10px] text-slate-500 block leading-snug">
                            {perm.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-pop transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? "جاري الحفظ والتطبيق..." : "حفظ وتحديث الصلاحيات فوراً"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-3.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs border border-slate-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card-surface shadow-pop p-6 sm:p-8 max-w-2xl w-full space-y-6 text-slate-900 animate-scaleUp my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-brand-700 text-white flex items-center justify-center shadow-pop">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    إضافة مستخدم / موظف جديد للنظام
                  </h3>
                  <span className="text-xs text-brand-700">
                    تحديد المدرسة والرتبة وتخصيص الصلاحيات فوراً
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs sm:text-sm">
              {/* School selection */}
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">
                  المدرسة التابع لها <span className="text-rose-600">*</span>
                </label>
                <select
                  name="tenantId"
                  required
                  className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 font-bold outline-none transition-colors"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    الاسم الكامل للمستخدم <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="مثال: أ. عمار شاكر"
                    className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    اسم المستخدم (Username) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="مثل: acc.ammar أو v.principal"
                    className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Password & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    كلمة المرور / الرمز السري <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="password"
                    required
                    defaultValue="pass123"
                    className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    رقم الهاتف / الواتساب
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="077XXXXXXXX"
                    className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Role & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    الرتبة والدور الأساسي
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRolePresetChange(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 font-bold outline-none transition-colors"
                  >
                    <option value="ADMIN">مدير المدرسة</option>
                    <option value="VICE_PRINCIPAL">معاون المدير / المشرف الإداري</option>
                    <option value="ACCOUNTANT">محاسب مالي / أمين الصندوق</option>
                    <option value="STAFF">موظف إداري / شؤون الطلبة</option>
                    <option value="SUPERVISOR">مشرف تربوي</option>
                    <option value="TEACHER">معلم / مدرس</option>
                    <option value="CUSTOM">دور مخصص</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    المسمى الوظيفي المخصص
                  </label>
                  <input
                    type="text"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder="مثل: أمين الصندوق، سكرتير الإدارة"
                    className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Permissions selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    تخصيص الصلاحيات ({formPermissions.length}/{ALL_SYSTEM_PERMISSIONS.length})
                  </h4>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold cursor-pointer"
                    >
                      الكل
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllPermissions}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 scrollbar-thin">
                  {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                    const isChecked = formPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2.5 select-none ${
                          isChecked
                            ? "bg-brand-50 border-brand-600 text-slate-900"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-brand-600 mt-0.5 cursor-pointer"
                        />
                        <span className="font-bold text-xs">{perm.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-pop transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? "جاري الإنشاء والتفعيل..." : "إنشاء وتفعيل حساب المستخدم"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs border border-slate-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {passwordResetUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPasswordResetUser(null)}
        >
          <div
            className="card-surface shadow-pop p-6 sm:p-8 max-w-md w-full space-y-5 text-slate-900 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">تغيير كلمة المرور</h3>
                  <span className="text-xs text-slate-500">@{passwordResetUser.username}</span>
                </div>
              </div>

              <button
                onClick={() => setPasswordResetUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">
                  كلمة المرور / الرمز الجديد <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full px-3.5 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-slate-900 placeholder-slate-400 outline-none transition-colors font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-pop transition-all"
                >
                  {loading ? "جاري التغيير..." : "تعيين كلمة المرور فوراً"}
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-4 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-600 font-bold border border-slate-300"
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
