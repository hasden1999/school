"use client";

import React, { useState } from "react";
import {
  reviewDailyReportAction,
  createAdminAnnouncementAction,
} from "@/app/actions/reportActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  MessageSquare,
  BookOpen,
  Calendar,
  User,
  Clock,
  Megaphone,
  Send,
  Users,
  GraduationCap,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface ReportsClientProps {
  reports: any[];
  classRooms?: any[];
  sections?: any[];
  students?: any[];
}

export const ReportsClient: React.FC<ReportsClientProps> = ({
  reports: initialReports,
  classRooms = [],
  sections = [],
  students = [],
}) => {
  const [reports, setReports] = useState<any[]>(initialReports);
  const [filter, setFilter] = useState<string>("PENDING_APPROVAL");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Announcement State
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [announcementScope, setAnnouncementScope] = useState<"ALL" | "CLASSROOM" | "STUDENT">("ALL");
  const [targetClassId, setTargetClassId] = useState(classRooms[0]?.id || "");
  const [targetSectionId, setTargetSectionId] = useState("");
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || "");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  const availableSections = sections.filter((s) => s.classRoomId === targetClassId);
  const filteredStudents = targetClassId
    ? students.filter((st) => st.classRoomId === targetClassId && (!targetSectionId || st.sectionId === targetSectionId))
    : students;

  const filteredReports = reports.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const handleApprove = async (reportId: string, notifyWhatsApp = true) => {
    setProcessing(true);
    try {
      await reviewDailyReportAction({
        reportId,
        decision: "APPROVE",
        notifyWhatsApp,
      });
      alert("تمت الموافقة على التقرير وجدولة الإشعار عبر واتساب للطلاب وأولياء الأمور.");
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setProcessing(true);
    try {
      await reviewDailyReportAction({
        reportId: selectedReport.id,
        decision: "REJECT",
        rejectionReason,
      });
      setIsRejectModalOpen(false);
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setProcessing(false);
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    setSendingAnnouncement(true);
    try {
      const res = await createAdminAnnouncementAction({
        targetScope: announcementScope,
        classRoomId: announcementScope !== "ALL" ? targetClassId : undefined,
        sectionId: announcementScope === "CLASSROOM" ? targetSectionId : undefined,
        studentId: announcementScope === "STUDENT" ? targetStudentId : undefined,
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
        notifyWhatsApp,
      });

      if (res.success) {
        alert("✓ " + res.message);
        setIsAnnouncementOpen(false);
        setAnnouncementTitle("");
        setAnnouncementMessage("");
      } else {
        alert(res.error || "فشل إرسال التبليغ");
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ غير متوقع");
    } finally {
      setSendingAnnouncement(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">التقارير اليومية والتعميمات</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تدقيق واعتماد ملخصات الدروس والواجبات، أو نشر تعميم وتبليغ إداري موجه لكافة المدرسة أو لصف أو طالب محدد.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAnnouncementOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all shadow-md"
          >
            <Megaphone className="w-4 h-4 text-amber-300" />
            <span>نشر تبليغ / تعميم إداري</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-sm w-fit">
        <button
          onClick={() => setFilter("PENDING_APPROVAL")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            filter === "PENDING_APPROVAL"
              ? "bg-amber-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          بانتظار المراجعة ({reports.filter((r) => r.status === "PENDING_APPROVAL").length})
        </button>
        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            filter === "APPROVED" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          المعتمدة
        </button>
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            filter === "ALL" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          الكل
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReports.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
            لا توجد تقارير في هذا التبويب حالياً.
          </div>
        ) : (
          filteredReports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{r.subject.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {r.classRoom.name} — شعبة ({r.section.name})
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      r.status === "APPROVED"
                        ? "success"
                        : r.status === "REJECTED"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {r.status === "APPROVED"
                      ? "معتمد ومنشور"
                      : r.status === "REJECTED"
                      ? "مرفوض"
                      : "قيد المراجعة"}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="text-xs font-black text-slate-900">{r.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.content}</p>
                  {r.homework && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-amber-900 font-medium">
                      📖 <span className="font-bold">الواجب المطلوب:</span> {r.homework}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {r.teacher.fullName}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {r.date}
                  </span>
                </div>

                {r.adminRejectionReason && (
                  <div className="p-2.5 bg-rose-50 rounded-xl text-rose-700 text-xs border border-rose-100">
                    سبب الرفض: {r.adminRejectionReason}
                  </div>
                )}
              </div>

              {/* Admin Actions Bar */}
              {r.status === "PENDING_APPROVAL" && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedReport(r);
                      setIsRejectModalOpen(true);
                    }}
                    disabled={processing}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>رفض للتعديل</span>
                  </button>

                  <button
                    onClick={() => handleApprove(r.id, true)}
                    disabled={processing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>موافقة ونشر + واتساب</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Reason Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="إرجاع التقرير للمعلم للتعديل" maxWidth="md">
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-xs text-slate-600">
            يرجى توضيح سبب الرفض أو الملاحظات المطلوبة ليتمكن المعلم من تصحيح التقرير وإعادة رفعه:
          </p>

          <textarea
            required
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="مثال: يرجى تحديد أرقام تمارين الواجب بدقة وتوضيح موعد التسليم..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-rose-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              تأكيد الرفض
            </button>
          </div>
        </form>
      </Modal>

      {/* Broadcast Announcement Modal */}
      {isAnnouncementOpen && (
        <Modal
          isOpen={isAnnouncementOpen}
          onClose={() => setIsAnnouncementOpen(false)}
          title="نشر تبليغ أو تعميم إداري رسمي"
          maxWidth="lg"
        >
          <form onSubmit={handleSendAnnouncement} className="space-y-4 font-cairo text-right" dir="rtl">
            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">نطاق توجيه التبليغ *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementScope("ALL")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    announcementScope === "ALL"
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>لكل المدرسة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementScope("CLASSROOM")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    announcementScope === "CLASSROOM"
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <span>لصف محدد</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementScope("STUDENT")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    announcementScope === "STUDENT"
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <User className="w-5 h-5 text-amber-400" />
                  <span>لطالب محدد</span>
                </button>
              </div>
            </div>

            {/* Classroom / Section Selectors */}
            {announcementScope === "CLASSROOM" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs animate-fadeIn">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف المستهدف *</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => {
                      setTargetClassId(e.target.value);
                      const secs = sections.filter((s) => s.classRoomId === e.target.value);
                      setTargetSectionId(secs[0]?.id || "");
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white outline-none"
                  >
                    {classRooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشعبة (اختياري / لكافة الشعب)</label>
                  <select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white outline-none"
                  >
                    <option value="">كافة شعب هذا الصف</option>
                    {availableSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        شعبة ({sec.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Student Selector */}
            {announcementScope === "STUDENT" && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تصفية حسب الصف:</label>
                    <select
                      value={targetClassId}
                      onChange={(e) => {
                        setTargetClassId(e.target.value);
                        const matched = students.find((st) => st.classRoomId === e.target.value);
                        if (matched) setTargetStudentId(matched.id);
                      }}
                      className="w-full p-2 rounded-xl border border-slate-200 font-bold bg-white outline-none"
                    >
                      <option value="">كافة الصفوف</option>
                      {classRooms.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اختيار الطالب المستهدف *</label>
                    <select
                      value={targetStudentId}
                      onChange={(e) => setTargetStudentId(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 font-bold bg-white outline-none"
                    >
                      {filteredStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.user?.fullName} — {st.classRoom?.name} ({st.section?.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Title & Message */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان التبليغ *</label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="مثال: موعد الامتحانات الشهرية / اجتماع أولياء الأمور / تنبيه هام"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نص التبليغ أو التوجيه *</label>
                <textarea
                  required
                  rows={4}
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="اكتب تفاصيل التبليغ الإداري هنا بشكل واضح..."
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="whatsAppNotify"
                  checked={notifyWhatsApp}
                  onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="whatsAppNotify" className="font-bold text-emerald-900 cursor-pointer">
                  📲 إرسال نسخة آلية فورية عبر واتساب إلى أرقام هواتف أولياء الأمور
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAnnouncementOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={sendingAnnouncement}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all shadow-md"
              >
                {sendingAnnouncement ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>نشر وإرسال التبليغ الآن</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
