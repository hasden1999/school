"use client";

import React, { useState, useEffect } from "react";
import { submitAttendanceAction, checkAttendancePermissionAction, getClassAttendanceData } from "@/app/actions/attendanceActions";
import { AttendanceRepository } from "@/lib/repositories/AttendanceRepository";
import { run9AMAttendanceAudit } from "@/lib/cronEngine";
import { Badge } from "@/components/ui/Badge";
import {
  UserCheck,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  Save,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface AttendanceClientProps {
  classRooms: any[];
  sections: any[];
  initialStudents: any[];
}

export const AttendanceClient: React.FC<AttendanceClientProps> = ({
  classRooms,
  sections,
  initialStudents,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(classRooms[0]?.id || "");
  const [selectedSectionId, setSelectedSectionId] = useState(
    sections.find((s) => s.classRoomId === classRooms[0]?.id)?.id || ""
  );
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);

  // Keep selected class valid when school stage changes
  React.useEffect(() => {
    if (classRooms.length > 0 && !classRooms.some((c) => c.id === selectedClassId)) {
      const firstClass = classRooms[0];
      setSelectedClassId(firstClass.id);
      const sec = sections.find((s) => s.classRoomId === firstClass.id);
      if (sec) setSelectedSectionId(sec.id);
    }
  }, [classRooms, sections, selectedClassId]);

  const [students, setStudents] = useState<any[]>(initialStudents);
  const [attendanceState, setAttendanceState] = useState<Record<string, "PRESENT" | "ABSENT" | "ON_LEAVE" | "LATE">>({});
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [permissionInfo, setPermissionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);

  const availableSections = sections.filter((s) => s.classRoomId === selectedClassId);

  const fetchRoster = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      let perm: any = { canTakeAttendance: true, isPeriod1: true, isOverridden: false };
      try {
        perm = await checkAttendancePermissionAction({
          classRoomId: selectedClassId,
          sectionId: selectedSectionId,
          dateStr,
        });
      } catch {
        // Fallback for offline mode
      }

      const roster = await AttendanceRepository.getClassAttendance(
        selectedClassId,
        selectedSectionId,
        dateStr
      );

      setPermissionInfo(perm);
      setStudents(roster);

      // Initialize status mapping
      const initialMap: Record<string, any> = {};
      const initialNotes: Record<string, any> = {};
      for (const s of roster) {
        const record = s.attendanceRecords?.[0];
        initialMap[s.id] = record ? record.status : "PRESENT";
        initialNotes[s.id] = record?.notes || "";
      }
      setAttendanceState(initialMap);
      setNotesState(initialNotes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId && selectedSectionId) {
      fetchRoster();
    }
  }, [selectedClassId, selectedSectionId, dateStr]);

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT" | "ON_LEAVE" | "LATE") => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        status: attendanceState[s.id] || "PRESENT",
        notes: notesState[s.id],
      }));

      const res = await AttendanceRepository.saveAttendance(
        selectedClassId,
        selectedSectionId,
        dateStr,
        records
      );

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else if (res.error) {
        alert(res.error);
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ أثناء حفظ الحضور");
    } finally {
      setSaving(false);
    }
  };

  const handleRun9AMAudit = async () => {
    try {
      const rep = await run9AMAttendanceAudit("al-nukhba", dateStr);
      setAuditReport(rep);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">سجل الحضور والغياب الذكي</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            رصد الحضور الصباحي (الحصة الأولى) مع الحسم الآلي للإجازات وتنبيهات الغياب الفورية عبر واتساب.
          </p>
        </div>

        <button
          onClick={handleRun9AMAudit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          <Clock className="w-4 h-4 text-brand-200" />
          <span>تدقيق حضور 9:00 ص</span>
        </button>
      </div>

      {auditReport && (
        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold">
            <span>تقرير تدقيق الحضور الصباحي:</span>
            <button onClick={() => setAuditReport(null)} className="text-indigo-600 hover:underline">
              إغلاق
            </button>
          </div>
          <div className="space-y-1 font-mono">
            {auditReport.details.map((d: string, i: number) => (
              <p key={i}>› {d}</p>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-surface p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">إجمالي الطلاب</span>
            <span className="text-lg font-bold text-slate-900">{students.length} طالب</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
            {students.length}
          </div>
        </div>

        <div className="card-surface p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-brand-700 block">حاضرون اليوم</span>
            <span className="text-lg font-bold text-brand-700">
              {students.filter((s) => (attendanceState[s.id] || "PRESENT") === "PRESENT").length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
        </div>

        <div className="card-surface p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-700 block">غائبون</span>
            <span className="text-lg font-bold text-rose-700">
              {students.filter((s) => attendanceState[s.id] === "ABSENT").length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
            ✕
          </div>
        </div>

        <div className="card-surface p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-700 block">مجازون / متأخرون</span>
            <span className="text-lg font-bold text-purple-700">
              {
                students.filter(
                  (s) =>
                    attendanceState[s.id] === "ON_LEAVE" || attendanceState[s.id] === "LATE"
                ).length
              }
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
            i
          </div>
        </div>
      </div>

      {/* Filter and Date Bar */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">تاريخ الحضور والمراجعة</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDateStr(new Date().toISOString().split("T")[0])}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dateStr === new Date().toISOString().split("T")[0]
                        ? "bg-brand-700 text-white"
                        : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    اليوم
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      setDateStr(d.toISOString().split("T")[0]);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dateStr ===
                      new Date(Date.now() - 86400000).toISOString().split("T")[0]
                        ? "bg-brand-700 text-white"
                        : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    أمس
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">الصف</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  const s = sections.find((sec) => sec.classRoomId === e.target.value);
                  setSelectedSectionId(s?.id || "");
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
              >
                {classRooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">الشعبة</label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
              >
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    شعبة ({s.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Mark All Present Button */}
            {dateStr === new Date().toISOString().split("T")[0] && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    const nextState: Record<string, "PRESENT" | "ABSENT" | "ON_LEAVE" | "LATE"> = {};
                    students.forEach((s) => {
                      nextState[s.id] = "PRESENT";
                    });
                    setAttendanceState(nextState);
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-brand-200 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-700" />
                  <span>تحديد الكل كحاضر ✅</span>
                </button>
              </div>
            )}
          </div>

          {/* Responsibility Indicator */}
          {permissionInfo && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                dateStr > new Date().toISOString().split("T")[0]
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : dateStr < new Date().toISOString().split("T")[0]
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : "bg-brand-50 text-brand-700 border-brand-100"
              }`}
            >
              {dateStr < new Date().toISOString().split("T")[0] ? (
                <Lock className="w-5 h-5 text-blue-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
              )}
              <div>
                <span className="font-bold block">
                  {dateStr > new Date().toISOString().split("T")[0]
                    ? `تاريخ مستقبلي لاحق: ${dateStr}`
                    : dateStr < new Date().toISOString().split("T")[0]
                    ? `مراجعة كشف يوم سابق: ${dateStr}`
                    : `معلم الحصة الأولى: ${permissionInfo.assignedTeacherName}`}
                </span>
                <span className="text-[10px] opacity-80">
                  {dateStr > new Date().toISOString().split("T")[0]
                    ? "لم يتم أخذ الحضور لهذا اليوم (تاريخ مستقبلي)"
                    : dateStr < new Date().toISOString().split("T")[0]
                    ? "سجل مؤرشف للاطلاع والمراجعة فقط — لا يمكن تعديل درجات الحضور للأيام السابقة"
                    : permissionInfo.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Day Status Banner */}
      {dateStr > new Date().toISOString().split("T")[0] ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">تنبيه: لم يتم أخذ الحضور لهذا اليوم ({dateStr})</h4>
              <p className="text-xs text-amber-800">
                هذا التاريخ مستقبلي ولم يحن موعد الدوام بعد — لا يمكن رصد الحضور المسبق قبل بدء اليوم الدراسي.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-[11px] border border-amber-200">
            تاريخ لاحق
          </span>
        </div>
      ) : dateStr < new Date().toISOString().split("T")[0] ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-blue-900">
                {students.some((s) => s.attendanceRecords && s.attendanceRecords.length > 0)
                  ? `كشف الحضور والغياب المؤرشف ليوم (${dateStr})`
                  : `تنبيه: لم يتم أخذ الحضور لهذا اليوم (${dateStr})`}
              </h4>
              <p className="text-xs text-blue-800">
                {students.some((s) => s.attendanceRecords && s.attendanceRecords.length > 0)
                  ? "سجل مؤرشف للاطلاع والمراجعة فقط — لا يمكن تعديل الحضور للأيام السابقة بعد انتهاء اليوم الدراسي."
                  : "انتهى هذا اليوم الدراسي السابق دون أخذ أو تثبيت كشف حضور."}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg text-[11px] border border-blue-200">
            للاطلاع فقط
          </span>
        </div>
      ) : (
        <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl text-brand-700 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-brand-800">حضور اليوم الحالي ({dateStr})</h4>
              <p className="text-xs text-brand-700">
                يمكنك رصد وتعديل حضور اليوم بحرية طوال ساعات اليوم الدراسي الحالي.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-brand-100 text-brand-800 font-bold rounded-lg text-[11px] border border-brand-200">
            متاح للتعديل اليوم
          </span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-lg bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-pop animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم حفظ سجل الحضور بنجاح وجدولة إشعارات الغياب لأولياء الأمور عبر واتساب.</span>
        </div>
      )}

      {/* Attendance Roster Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">اسم الطالب</th>
                <th className="p-4">الرقم المدرسي</th>
                <th className="p-4 text-center">حالة الحضور</th>
                <th className="p-4">ملاحظات (سبب الإجازة/التأخير)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    جاري تحميل الكشف...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    لا يوجد طلاب مسجلين في هذه الشعبة.
                  </td>
                </tr>
              ) : (
                students.map((s, idx) => {
                  const currentStatus = attendanceState[s.id] || "PRESENT";
                  const isToday = dateStr === new Date().toISOString().split("T")[0];
                  const isPastDate = dateStr < new Date().toISOString().split("T")[0];
                  const isFutureDate = dateStr > new Date().toISOString().split("T")[0];
                  const isReadOnly = isPastDate || isFutureDate;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-4 font-bold text-slate-900">
                        <span>{s.user.fullName}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">{s.studentNumber}</td>

                      <td className="p-4 text-center">
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleStatusChange(s.id, "PRESENT")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === "PRESENT"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-200/60"
                            } disabled:cursor-not-allowed disabled:opacity-80`}
                          >
                            حاضر
                          </button>

                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleStatusChange(s.id, "ABSENT")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === "ABSENT"
                                ? "bg-rose-600 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-200/60"
                            } disabled:cursor-not-allowed disabled:opacity-80`}
                          >
                            غائب
                          </button>

                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleStatusChange(s.id, "ON_LEAVE")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === "ON_LEAVE"
                                ? "bg-purple-600 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-200/60"
                            } disabled:cursor-not-allowed disabled:opacity-80`}
                          >
                            مجاز
                          </button>

                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleStatusChange(s.id, "LATE")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === "LATE"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-200/60"
                            } disabled:cursor-not-allowed disabled:opacity-80`}
                          >
                            متأخر
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={notesState[s.id] || ""}
                          onChange={(e) =>
                            setNotesState({ ...notesState, [s.id]: e.target.value })
                          }
                          placeholder={isReadOnly ? "سجل مؤرشف" : "ملاحظات اختيارية..."}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Submit / Archive Bar */}
        {dateStr < new Date().toISOString().split("T")[0] ? (
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>🔒 هذا الكشف يخص يوماً سابقاً وهو مؤرشف للاطلاع والمراجعة فقط — لا يمكن تعديل الحضور بعد انتهاء اليوم.</span>
            </div>
            <span className="px-3.5 py-1.5 bg-white text-slate-700 font-bold rounded-xl text-xs border border-slate-200 shadow-sm">
              للاطلاع فقط (مغلق)
            </span>
          </div>
        ) : dateStr > new Date().toISOString().split("T")[0] ? (
          <div className="p-4 bg-amber-50 border-t border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>⚠️ تاريخ مستقبلي لاحق — لا يمكن رصد الحضور المسبق قبل بدء اليوم الدراسي.</span>
            </div>
            <span className="px-3.5 py-1.5 bg-amber-100 text-amber-900 font-bold rounded-xl text-xs border border-amber-200 shadow-sm">
              تاريخ لاحق
            </span>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              💡 سيتم إرسال رسالة واتساب تلقائية فورية لولي أمر أي طالب يُسجل بحالة "غائب".
            </span>

            <button
              onClick={handleSaveAttendance}
              disabled={saving || students.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-black transition-all shadow-md"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ واعتماد كشف الحضور</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
