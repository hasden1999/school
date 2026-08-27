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
} from "@/app/actions/userManagementActions";
import {
  updateClassPermissionPolicyAction,
  updateStudentOverrideAction,
} from "@/app/actions/permissionsPolicyActions";
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
  Eye,
  Crown,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  Layers,
} from "lucide-react";

interface PermissionsClientProps {
  users: any[];
  classRooms: any[];
  students: any[];
  currentUser: any;
}

export const PermissionsClient: React.FC<PermissionsClientProps> = ({
  users: initialUsers,
  classRooms: initialClassRooms,
  students: initialStudents,
  currentUser,
}) => {
  // Main Partitioned Tab
  const [activeMainTab, setActiveMainTab] = useState<"STUDENTS" | "STAFF" | "TEACHERS">("STUDENTS");

  // Users State (Staff & Teachers)
  const [users, setUsers] = useState<any[]>(initialUsers || []);
  const [classRooms, setClassRooms] = useState<any[]>(initialClassRooms || []);
  const [students, setStudents] = useState<any[]>(initialStudents || []);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");

  // Selected for Edit
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
  const [studentOverrideModalOpen, setStudentOverrideModalOpen] = useState(false);

  // Edit Staff State
  const [editRole, setEditRole] = useState("STAFF");
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editMonthlySalary, setEditMonthlySalary] = useState(0);
  const [selectedPermissions, setSelectedPermissions] = useState<SystemPermission[]>([]);

  // Student Override State
  const [studentAllowClassGrades, setStudentAllowClassGrades] = useState(false);
  const [studentIsRep, setStudentIsRep] = useState(false);
  const [studentCanReports, setStudentCanReports] = useState(true);
  const [studentNotes, setStudentNotes] = useState("");

  // Loading & Feedback
  const [loadingAction, setLoadingAction] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPasscode, setNewPasscode] = useState("");

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // Category mapping for staff
  const permissionCategories = [
    { key: "مالي", label: "العمليات المالية وتخفيض الأقساط", icon: CreditCard },
    { key: "إداري", label: "شؤون الطلاب والكادر والقبول", icon: GraduationCap },
    { key: "أكاديمي", label: "الدرجات والجداول والتقارير اليومية", icon: Award },
    { key: "نظام", label: "إعدادات النظام والرسائل والنسخ", icon: Settings },
  ];

  // Filtered lists
  const staffUsers = (users || []).filter((u) => u && ["ADMIN", "VICE_PRINCIPAL", "ACCOUNTANT", "STAFF", "CUSTOM"].includes(u.role));
  const teacherUsers = (users || []).filter((u) => u && u.role === "TEACHER");

  const filteredStaff = staffUsers.filter((u) => {
    if (!u) return false;
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchesRole = staffRoleFilter === "ALL" || u.role === staffRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredTeachers = teacherUsers.filter((u) => {
    if (!u) return false;
    return (
      (u.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm))
    );
  });

  const filteredStudents = (students || []).filter((s) => {
    if (!s) return false;
    const matchesSearch =
      (s.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.username || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "ALL" || s.classRoomId === classFilter;
    return matchesSearch && matchesClass;
  });

  // Handlers
  const handleOpenEditStaff = (user: any) => {
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
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSaveStaffPermissions = async () => {
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
        setTimeout(() => setEditModalOpen(false), 1200);
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "حدث خطأ غير متوقع أثناء الحفظ" });
    } finally {
      setLoadingAction(false);
    }
  };

  // Class Policy Toggle Handler
  const handleToggleClassPolicy = async (classRoomId: string, field: string, currentValue: boolean) => {
    const newValue = !currentValue;
    // Optimistic update
    setClassRooms((prev) =>
      prev.map((c) => (c.id === classRoomId ? { ...c, [field]: newValue } : c))
    );

    try {
      await updateClassPermissionPolicyAction(classRoomId, { [field]: newValue } as any);
    } catch (e) {
      alert("فشل تحديث سياسة الصف");
    }
  };

  // Student Override Handlers
  const handleOpenStudentOverride = (student: any) => {
    setSelectedStudent(student);
    setStudentAllowClassGrades(student.allowViewClassGrades ?? false);
    setStudentIsRep(student.isClassRepresentative ?? false);
    setStudentCanReports(student.canViewReports ?? true);
    setStudentNotes(student.notes || "");
    setFeedbackMsg(null);
    setStudentOverrideModalOpen(true);
  };

  const handleSaveStudentOverride = async () => {
    if (!selectedStudent) return;
    setLoadingAction(true);
    setFeedbackMsg(null);

    try {
      const res = await updateStudentOverrideAction(selectedStudent.userId, {
        allowViewClassGrades: studentAllowClassGrades,
        isClassRepresentative: studentIsRep,
        canViewReports: studentCanReports,
        notes: studentNotes,
      });

      if (res?.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudent.id
              ? {
                  ...s,
                  allowViewClassGrades: studentAllowClassGrades,
                  isClassRepresentative: studentIsRep,
                  canViewReports: studentCanReports,
                  notes: studentNotes,
                }
              : s
          )
        );
        setFeedbackMsg({ type: "success", text: "تم اعتماد الاستثناء الخاص بالطالب بنجاح!" });
        setTimeout(() => setStudentOverrideModalOpen(false), 1200);
      } else {
        setFeedbackMsg({ type: "error", text: res?.error || "فشل الحفظ" });
      }
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
            <span>مركز السيادة وإدارة الصلاحيات المقسمة والسياسات الاستثنائية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            إدارة الصلاحيات: الطلاب، الموظفين، والكادر التعليمي
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            تحكم شامل مقسم بثلاثة أجنحة: إعدادات تلقائية لكل قطاع، مع إمكانية منح استثناءات فورية لصف محدد أو طالب معين (مثل استعراض درجات الصف بالكامل) وتخصيص صلاحيات الكادر.
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
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* 3 Partitioned Segmented Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-1.5 rounded-2xl bg-slate-200/70 border border-slate-300 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setActiveMainTab("STUDENTS");
            setSearchTerm("");
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeMainTab === "STUDENTS"
              ? "bg-white text-emerald-900 shadow-sm border border-emerald-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <GraduationCap className="w-5 h-5 text-emerald-700" />
          <div className="text-right">
            <span className="block">صلاحيات وبوابات الطلاب والصفوف</span>
            <span className="block text-[10px] font-normal text-slate-500">استثناءات الصفوف، لوحة الشرف، ممثلو الصف</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab("STAFF");
            setSearchTerm("");
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeMainTab === "STAFF"
              ? "bg-white text-emerald-900 shadow-sm border border-emerald-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <CreditCard className="w-5 h-5 text-blue-700" />
          <div className="text-right">
            <span className="block">الكادر الإداري والمحاسبي</span>
            <span className="block text-[10px] font-normal text-slate-500">المحاسبة، تخفيض الأقساط، الشؤون الإدارية</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab("TEACHERS");
            setSearchTerm("");
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeMainTab === "TEACHERS"
              ? "bg-white text-emerald-900 shadow-sm border border-emerald-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Award className="w-5 h-5 text-purple-700" />
          <div className="text-right">
            <span className="block">الهيئة التدريسية والمعلمون</span>
            <span className="block text-[10px] font-normal text-slate-500">رصد الدرجات والحضور، الإشراف الأكاديمي</span>
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STUDENTS & CLASSROOM POLICIES                      */}
      {/* ======================================================== */}
      {activeMainTab === "STUDENTS" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Default Student Policy Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  السياسة التلقائية العامة لبوابة الطالب وولي الأمر
                </h3>
                <p className="text-xs text-slate-500">
                  الإعدادات المعيارية التي تنطبق على جميع الطلاب ما لم يتم تخصيص استثناء لصف أو طالب محدد
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-slate-800">استعراض السعي والدرجات الشخصية</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-slate-800">استعراض الواجبات والتقارير اليومية</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-slate-800">تقديم طلبات الإجازة الإلكترونية</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-slate-800">المشاركة في تقييم الأساتذة السري</span>
              </div>
            </div>
          </div>

          {/* Section A: Class-Level Policies & Full Grades Visibility */}
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-800" />
                  <span>سياسات واستثناءات الصفوف الدراسية (Class-Wide Overrides)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  التحكم في إمكانية مشاهدة درجات وشيت الصف بالكامل لكل صف لتعزيز التنافس والشفافية
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-enterprise text-xs">
                <thead>
                  <tr>
                    <th className="text-right">المرحلة والصف الدراسي</th>
                    <th className="text-center">عدد الطلاب</th>
                    <th className="text-center">مشاهدة درجات وشيت الصف كاملاً للطلاب 📊</th>
                    <th className="text-center">إظهار الشهادات والنتائج الرسمية 📜</th>
                    <th className="text-center">تقييم الأساتذة</th>
                  </tr>
                </thead>
                <tbody>
                  {classRooms.map((cls) => (
                    <tr key={cls.id}>
                      <td className="font-bold text-slate-900 text-xs sm:text-sm">
                        {cls.name}
                      </td>

                      <td className="text-center font-bold text-slate-600">
                        {cls._count?.studentProfiles || 0} طالب
                      </td>

                      {/* Toggle: View Full Class Grades */}
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleClassPolicy(cls.id, "allowViewFullClassGrades", cls.allowViewFullClassGrades)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all inline-flex items-center gap-1.5 border cursor-pointer ${
                            cls.allowViewFullClassGrades
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {cls.allowViewFullClassGrades ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-800" />
                              <span>مفعل لطلاب هذا الصف ✅</span>
                            </>
                          ) : (
                            <span>خاص (درجاته فقط) 🔒</span>
                          )}
                        </button>
                      </td>

                      {/* Toggle: View Honor Roll / Certificates */}
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleClassPolicy(cls.id, "allowViewHonorRoll", cls.allowViewHonorRoll)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all inline-flex items-center gap-1.5 border cursor-pointer ${
                            cls.allowViewHonorRoll
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {cls.allowViewHonorRoll ? "متاح للجميع" : "محجوب مؤقتاً"}
                        </button>
                      </td>

                      {/* Toggle: Teacher Evaluation */}
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleClassPolicy(cls.id, "allowTeacherEvaluation", cls.allowTeacherEvaluation)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all inline-flex items-center gap-1.5 border cursor-pointer ${
                            cls.allowTeacherEvaluation
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {cls.allowTeacherEvaluation ? "مفعل" : "معطل"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Student-Specific Individual Overrides */}
          <div className="card-surface p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <span>استثناءات الطلاب المحددين (Individual Student Overrides)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  منح طالب معين (كابتن أو ممثل الصف) صلاحيات خاصة مثل مشاهدة درجات الصف بالكامل
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="بحث عن طالب بالاسم أو الرقم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-9 pl-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                >
                  <option value="ALL">كافة الصفوف</option>
                  {classRooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-enterprise text-xs">
                <thead>
                  <tr>
                    <th className="text-right">الطالب والاسم الرباعي</th>
                    <th className="text-center">الصف والشعبة</th>
                    <th className="text-center">اسم المستخدم</th>
                    <th className="text-center">الصلاحيات والاستثناءات الممنوحة</th>
                    <th className="text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.slice(0, 50).map((st) => {
                    const hasSpecial = st.allowViewClassGrades || st.isClassRepresentative;
                    return (
                      <tr key={st.id} className={hasSpecial ? "bg-amber-50/40" : ""}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                              {(st.fullName || "ط").charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">
                                {st.fullName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {st.studentNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="text-center font-medium text-slate-700">
                          {st.className}
                        </td>

                        <td className="text-center">
                          <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {st.username}
                          </span>
                        </td>

                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {st.allowViewClassGrades && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>شيت درجات الصف</span>
                              </span>
                            )}
                            {st.isClassRepresentative && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                <span>ممثل الصف 👑</span>
                              </span>
                            )}
                            {!hasSpecial && (
                              <span className="text-slate-400 text-xs">صلاحيات قياسية</span>
                            )}
                          </div>
                        </td>

                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenStudentOverride(st)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors border border-emerald-200 flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>تخصيص الصلاحيات</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STAFF & ACCOUNTING PERMISSIONS                     */}
      {/* ======================================================== */}
      {activeMainTab === "STAFF" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search & Filter */}
          <div className="card-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث بالاسم، اسم المستخدم، الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {[
                { key: "ALL", label: "كافة الكادر الإداري" },
                { key: "ADMIN", label: "المدير العام" },
                { key: "VICE_PRINCIPAL", label: "المعاونون" },
                { key: "ACCOUNTANT", label: "المحاسبون" },
                { key: "STAFF", label: "شؤون الطلبة" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStaffRoleFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    staffRoleFilter === tab.key
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Table */}
          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-enterprise text-xs">
                <thead>
                  <tr>
                    <th className="text-right">الموظف والاسم الكامل</th>
                    <th className="text-center">الدور والرتبة</th>
                    <th className="text-center">اسم المستخدم</th>
                    <th className="text-center">حجم الصلاحيات الممنوحة</th>
                    <th className="text-center">الصلاحيات المالية وتخفيض الأقساط</th>
                    <th className="text-center">الحالة</th>
                    <th className="text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((u) => {
                    const perms = getUserEffectivePermissions(u);
                    const hasDiscount = perms.includes("MANAGE_DISCOUNTS");
                    const hasPayments = perms.includes("MANAGE_PAYMENTS");

                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {(u.fullName || "م").charAt(0)}
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
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                            {perms.length} صلاحية
                          </span>
                        </td>

                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {hasPayments && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                قبض وصولات 💳
                              </span>
                            )}
                            {hasDiscount && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                تخفيض أقساط 🎁
                              </span>
                            )}
                            {!hasPayments && !hasDiscount && (
                              <span className="text-slate-400 text-xs">لا توجد</span>
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
                              onClick={() => handleOpenEditStaff(u)}
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
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TEACHERS & ACADEMIC FACULTY                        */}
      {/* ======================================================== */}
      {activeMainTab === "TEACHERS" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث في الكادر التعليمي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div className="text-xs font-bold text-slate-600">
              إجمالي المعلمين: {filteredTeachers.length} أستاذ
            </div>
          </div>

          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-enterprise text-xs">
                <thead>
                  <tr>
                    <th className="text-right">الأستاذ / المعلم</th>
                    <th className="text-center">اسم المستخدم</th>
                    <th className="text-center">رقم الهاتف</th>
                    <th className="text-center">الصلاحيات الأكاديمية</th>
                    <th className="text-center">الحالة</th>
                    <th className="text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {(t.fullName || "أ").charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                              {t.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {t.jobTitle || "معلم مادة"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="text-center">
                        <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {t.username}
                        </span>
                      </td>

                      <td className="text-center">
                        <span className="font-mono text-xs text-slate-600" dir="ltr">
                          {t.phone || "—"}
                        </span>
                      </td>

                      <td className="text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          بوابة التدريس ورصد الدرجات والتقارير
                        </span>
                      </td>

                      <td className="text-center">
                        {t.active !== false ? (
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
                            onClick={() => handleOpenEditStaff(t)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200 flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ترقية / تخصيص</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(t);
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS                                                    */}
      {/* ======================================================== */}

      {/* Student Specific Override Modal */}
      {studentOverrideModalOpen && selectedStudent && (
        <Modal
          isOpen={studentOverrideModalOpen}
          onClose={() => setStudentOverrideModalOpen(false)}
          title={`تخصيص استثناءات الطالب: ${selectedStudent.fullName}`}
          maxWidth="lg"
        >
          <div className="space-y-5 font-cairo">
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

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
              <span className="font-bold text-amber-900 block">
                الصف: {selectedStudent.className} — اسم المستخدم: {selectedStudent.username}
              </span>
              <p className="text-slate-600">
                يمكنك هنا منح هذا الطالب صلاحيات خاصة واستثنائية تظهر له في بوابته الإلكترونية مباشرة.
              </p>
            </div>

            <div className="space-y-3">
              {/* Toggle 1: View Full Class Grades */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={studentAllowClassGrades}
                  onChange={(e) => setStudentAllowClassGrades(e.target.checked)}
                  className="mt-1 rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    السماح بمشاهدة درجات وشيت الصف كاملاً (View Full Class Roster) 📊
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    يُمكّن الطالب من فتح تبويب درجات الصف كاملاً والاطلاع على درجات زملائه وترتيبهم.
                  </span>
                </div>
              </label>

              {/* Toggle 2: Class Representative */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={studentIsRep}
                  onChange={(e) => setStudentIsRep(e.target.checked)}
                  className="mt-1 rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    تعيين كـ "ممثل الصف / كابتن الشعبة" 👑
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    يمنح الطالب وساماً رسمياً في ملفه وبوابته كممثل معتمد للصف أمام الإدارة.
                  </span>
                </div>
              </label>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات أو قرار الإدارة:
                </label>
                <input
                  type="text"
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="مثال: منحة بقرار المدير العام..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStudentOverrideModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={loadingAction}
                onClick={handleSaveStudentOverride}
                className="px-6 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loadingAction ? "جاري الحفظ..." : "حفظ واعتماد الاستثناء"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Staff Permissions Modal */}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
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

            {/* Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                تطبيق قالب صلاحيات سريع:
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

            {/* Granular Permissions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  الصلاحيات التفصيلية الممنوحة ({selectedPermissions.length} من {ALL_SYSTEM_PERMISSIONS.length})
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

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {permissionCategories.map((cat) => {
                  const catPerms = ALL_SYSTEM_PERMISSIONS.filter((p) => p.category === cat.key);
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                        <Icon className="w-4 h-4 text-emerald-800" />
                        <span className="text-xs font-bold text-slate-800">{cat.label}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catPerms.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? "bg-emerald-50 border-emerald-300 text-slate-900"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-bold block leading-tight">
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

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded text-emerald-700"
                />
                <span>الحساب مفعّل ونشط</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={loadingAction}
                  onClick={handleSaveStaffPermissions}
                  className="px-6 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loadingAction ? "جاري الحفظ..." : "حفظ واعتماد الصلاحيات"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create User Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="إضافة مستخدم أو كادر جديد"
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
                  placeholder="مثال: علي عبد الحسين"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المستخدم للدخول *</label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="مثال: ali_admin"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">كلمة المرور *</label>
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
                <label className="block text-slate-700 font-bold mb-1">الدور الوظيفي</label>
                <select
                  name="role"
                  defaultValue="STAFF"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                >
                  <option value="STAFF">موظف إداري / شؤون طلبة</option>
                  <option value="ACCOUNTANT">محاسب مالي / أمين صندوق</option>
                  <option value="VICE_PRINCIPAL">معاون مدير</option>
                  <option value="SUPERVISOR">مشرف تربوي</option>
                  <option value="TEACHER">معلم / مدرس</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs"
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

      {/* Reset Pass Modal */}
      {resetPassModalOpen && selectedUser && (
        <Modal
          isOpen={resetPassModalOpen}
          onClose={() => setResetPassModalOpen(false)}
          title={`إعادة تعيين كلمة المرور: ${selectedUser.fullName}`}
          maxWidth="sm"
        >
          <div className="space-y-4 font-cairo">
            <p className="text-xs text-slate-600">
              أدخل كلمة المرور الجديدة للمستخدم ({selectedUser.username}):
            </p>

            <div>
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
