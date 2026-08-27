"use client";

import React, { useState, useEffect } from "react";
import { submitAttendanceAction, checkAttendancePermissionAction, getClassAttendanceData } from "@/app/actions/attendanceActions";
import {
  UserCheck,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Info,
} from "lucide-react";

interface TeacherAttendanceClientProps {
  assignments: any[];
}

export const TeacherAttendanceClient: React.FC<TeacherAttendanceClientProps> = ({
  assignments,
}) => {
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, "PRESENT" | "ABSENT" | "ON_LEAVE" | "LATE">>({});
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [permissionInfo, setPermissionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeAssignment = assignments[selectedAssignmentIndex];

  const fetchRoster = async () => {
    if (!activeAssignment) return;
    setLoading(true);
    setSaveSuccess(false);
    try {
      const [perm, roster] = await Promise.all([
        checkAttendancePermissionAction({
          classRoomId: activeAssignment.classRoomId,
          sectionId: activeAssignment.sectionId,
          dateStr,
        }),
        getClassAttendanceData({
          classRoomId: activeAssignment.classRoomId,
          sectionId: activeAssignment.sectionId,
          dateStr,
        }),
      ]);

      setPermissionInfo(perm);
      setStudents(roster);

      const initialMap: Record<string, any> = {};
      const initialNotes: Record<string, any> = {};
      for (const s of roster) {
        const record = s.attendanceRecords[0];
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
    fetchRoster();
  }, [selectedAssignmentIndex, dateStr]);

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT" | "ON_LEAVE" | "LATE") => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!activeAssignment || !permissionInfo?.canTakeAttendance) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        status: attendanceState[s.id] || "PRESENT",
        notes: notesState[s.id],
      }));

      const res = await submitAttendanceAction({
        classRoomId: activeAssignment.classRoomId,
        sectionId: activeAssignment.sectionId,
        dateStr,
        records,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else if (res.error) {
        alert(res.error);
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">تسجيل الحضور الصباحي (الحصة الأولى)</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          يُفعل خيار رصد الحضور لمعلم الحصة الأولى فقط بناءً على جدول الحصص اليومي المعتمد.
        </p>
      </div>

      {/* Selector Bar */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">الصف والشعبة</label>
              <select
                value={selectedAssignmentIndex}
                onChange={(e) => setSelectedAssignmentIndex(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
              >
                {assignments.map((a, i) => (
                  <option key={a.id} value={i}>
                    {a.classRoom.name} — شعبة ({a.section.name}) [{a.subject.name}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">تاريخ الحضور والمراجعة</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDateStr(new Date().toISOString().split("T")[0])}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dateStr === new Date().toISOString().split("T")[0]
                        ? "bg-brand-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    أمس
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Permission & Past/Future Status Box */}
          {permissionInfo && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                dateStr > new Date().toISOString().split("T")[0]
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : dateStr < new Date().toISOString().split("T")[0]
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : permissionInfo.canTakeAttendance
                  ? "bg-brand-50 text-brand-700 border-brand-100"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {dateStr > new Date().toISOString().split("T")[0] ? (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : dateStr < new Date().toISOString().split("T")[0] ? (
                <Lock className="w-5 h-5 text-blue-600 shrink-0" />
              ) : permissionInfo.canTakeAttendance ? (
                <UserCheck className="w-5 h-5 text-brand-700 shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <div>
                <span className="font-bold block">
                  {dateStr > new Date().toISOString().split("T")[0]
                    ? `تاريخ مستقبلي لاحق (${dateStr})`
                    : dateStr < new Date().toISOString().split("T")[0]
                    ? `سجل مؤرشف ليوم سابق (${dateStr})`
                    : permissionInfo.message}
                </span>
                <span className="text-[10px] opacity-80">
                  {dateStr > new Date().toISOString().split("T")[0]
                    ? "لم يتم أخذ الحضور لهذا اليوم (لا يمكن رصد الحضور المسبق)."
                    : dateStr < new Date().toISOString().split("T")[0]
                    ? "هذا السجل يخص يوماً سابقاً وهو مؤرشف للقراءة والمراجعة فقط — لا يمكن تعديل الحضور بعد انتهاء اليوم."
                    : permissionInfo.canTakeAttendance
                    ? "يمكنك رصد وتعديل كشف حضور اليوم وحفظه طوال اليوم الحالي."
                    : "الزر مقفل لعدم كونك معلم الحصة الأولى لهذا اليوم."}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Day Status Banner */}
      {dateStr > new Date().toISOString().split("T")[0] ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">تنبيه: لم يتم أخذ الحضور لهذا اليوم ({dateStr})</h4>
              <p className="text-xs text-amber-600">
                هذا التاريخ لم يأتِ بعد — لا يمكن تسجيل أو تعديل الحضور في تواريخ مستقبلية مسبقاً.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold rounded-lg text-[11px] border border-amber-200">
            تاريخ لاحق
          </span>
        </div>
      ) : dateStr < new Date().toISOString().split("T")[0] ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
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
              <p className="text-xs text-blue-600">
                {students.some((s) => s.attendanceRecords && s.attendanceRecords.length > 0)
                  ? "سجل رسمي مؤرشف للمراجعة والتدقيق فقط — تم قفل التعديل بانتهاء اليوم الدراسي."
                  : "انتهى هذا اليوم الدراسي السابق دون تسجيل كشف حضور."}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] border border-blue-200">
            أرشيف سابق
          </span>
        </div>
      ) : (
        <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl text-brand-700 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-brand-900">حضور اليوم الحالي ({dateStr})</h4>
              <p className="text-xs text-brand-700">
                يمكنك تسجيل وتعديل الحضور في أي وقت خلال اليوم الدراسي الحالي.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-brand-100 text-brand-700 font-bold rounded-lg text-[11px] border border-brand-100">
            متاح للتعديل اليوم
          </span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-pop animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم حفظ سجل الحضور بنجاح واعتماده.</span>
        </div>
      )}

      {/* 1-Click Fast Bulk Attendance Bar */}
      <div className="card-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50/60 border border-emerald-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">إجراء سريع بنقرة واحدة:</span>
            <span className="text-[11px] text-slate-500">اجعل جميع الطلاب حاضرين ثم حدد الغائبين فقط</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              const allPresentMap: Record<string, "PRESENT"> = {};
              students.forEach((s) => {
                allPresentMap[s.id] = "PRESENT";
              });
              setAttendanceState(allPresentMap);
            }}
            className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>الكل حاضرون اليوم ✅</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving || !permissionInfo?.canTakeAttendance}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial justify-center"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? "جاري الحفظ..." : "حفظ الكشف 💾"}</span>
          </button>
        </div>
      </div>

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
                <th className="p-4">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    جاري تحميل كشف الصف...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    لا يوجد طلاب مسجلين في هذه الشعبة.
                  </td>
                </tr>
              ) : (
                students.map((s, idx) => {
                  const currentStatus = attendanceState[s.id] || "PRESENT";
                  const isPastDate = dateStr < new Date().toISOString().split("T")[0];
                  const isDisabled = !permissionInfo?.canTakeAttendance || isPastDate;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-4 font-bold text-slate-900">{s.user.fullName}</td>
                      <td className="p-4 font-mono text-slate-500">{s.studentNumber}</td>

                      <td className="p-4 text-center">
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleStatusChange(s.id, "PRESENT")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === "PRESENT"
                                ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 shadow-sm"
                                : "text-slate-600 hover:bg-slate-200/60"
                            } disabled:opacity-70`}
                          >
                            حاضر
                          </button>

                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleStatusChange(s.id, "ABSENT")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === "ABSENT"
                                ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 shadow-sm"
                                : "text-slate-600 hover:bg-slate-200/60"
                            } disabled:opacity-70`}
                          >
                            غائب
                          </button>

                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleStatusChange(s.id, "ON_LEAVE")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === "ON_LEAVE"
                                ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 shadow-sm"
                                : "text-slate-600 hover:bg-slate-200/60"
                            } disabled:opacity-70`}
                          >
                            مجاز
                          </button>

                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleStatusChange(s.id, "LATE")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === "LATE"
                                ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 shadow-sm"
                                : "text-slate-600 hover:bg-slate-200/60"
                            } disabled:opacity-70`}
                          >
                            متأخر
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          disabled={isDisabled}
                          value={notesState[s.id] || ""}
                          onChange={(e) =>
                            setNotesState({ ...notesState, [s.id]: e.target.value })
                          }
                          placeholder={isDisabled ? "مغلق" : "ملاحظة..."}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors disabled:bg-slate-100"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Save Button / Read Only Box */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {dateStr < new Date().toISOString().split("T")[0] ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>هذا الكشف يخص يوماً سابقاً وهو مؤرشف للاطلاع والمراجعة فقط — لا يمكن تعديل الحضور بعد انتهاء اليوم.</span>
              </div>
              <span className="px-3.5 py-1.5 bg-white text-slate-700 font-bold rounded-xl text-xs border border-slate-200 shadow-sm">
                للاطلاع فقط (مغلق)
              </span>
            </div>
          ) : dateStr > new Date().toISOString().split("T")[0] ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>تاريخ مستقبلي لاحق — لا يمكن رصد الحضور المسبق قبل موعد بدء اليوم الدراسي.</span>
              </div>
              <span className="px-3.5 py-1.5 bg-amber-100 text-amber-700 font-bold rounded-xl text-xs border border-amber-200 shadow-sm">
                تاريخ لاحق
              </span>
            </div>
          ) : permissionInfo?.canTakeAttendance ? (
            <>
              <span className="text-xs text-slate-500 font-medium">
                عند حفظ الكشف سيتم إشعار أولياء أمور الطلاب الغائبين فوراً عبر واتساب.
              </span>

              <button
                onClick={handleSaveAttendance}
                disabled={saving || students.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 disabled:bg-brand-300 text-white text-xs font-bold transition-all shadow-md"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>حفظ واعتماد كشف الحضور</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              تسجيل الحضور متاح فقط لمعلم الحصة الأولى لليوم الدراسي الحالي.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
