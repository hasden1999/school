"use client";

import React, { useState } from "react";
import {
  saveTimetableSlotAction,
  deleteTimetableSlotAction,
  clearEntireClassScheduleAction,
  autoGenerateScheduleAction,
  createTeacherLeaveAction,
  assignSubstituteTeacherAction,
} from "@/app/actions/scheduleActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { TimetablePrintModal } from "@/components/print/TimetablePrintModal";
import { formatTeacherName } from "@/lib/attendanceLogic";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Sparkles,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  ShieldAlert,
  Plus,
  RefreshCw,
  Info,
  CalendarCheck,
  Zap,
  Printer,
} from "lucide-react";

interface ScheduleClientProps {
  classRooms: any[];
  teachers: any[];
  subjects: any[];
  allSlots: any[];
  teacherLeaves: any[];
  impacts: any[];
  tenant?: any;
}

export const ScheduleClient: React.FC<ScheduleClientProps> = ({
  classRooms,
  teachers,
  subjects,
  allSlots,
  teacherLeaves,
  impacts,
  tenant,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(classRooms[0]?.id || "");
  const [selectedSectionId, setSelectedSectionId] = useState(
    classRooms[0]?.sections[0]?.id || ""
  );

  // Keep selected class valid when school stage changes
  React.useEffect(() => {
    if (classRooms.length > 0 && !classRooms.some((c) => c.id === selectedClassId)) {
      const firstClass = classRooms[0];
      setSelectedClassId(firstClass.id);
      setSelectedSectionId(firstClass.sections?.[0]?.id || "");
    }
  }, [classRooms, selectedClassId]);

  // Edit Slot Modal
  const [editingSlot, setEditingSlot] = useState<{
    dayOfWeek: string;
    dayLabel: string;
    periodNumber: number;
    currentSlot?: any;
  } | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [savingSlot, setSavingSlot] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Auto-Fill state
  const [generating, setGenerating] = useState(false);
  const [clearingSchedule, setClearingSchedule] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Teacher Leave Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveTeacherId, setLeaveTeacherId] = useState(teachers[0]?.id || "");
  const [leaveStartDate, setLeaveStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [leaveEndDate, setLeaveEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [leaveReason, setLeaveReason] = useState("");
  const [savingLeave, setSavingLeave] = useState(false);

  // Substitute Assignment
  const [assigningSub, setAssigningSub] = useState<string | null>(null);

  const currentClass = classRooms.find((c) => c.id === selectedClassId);
  const currentSections = currentClass?.sections || [];

  const days = [
    { key: "SUNDAY", label: "الأحد" },
    { key: "MONDAY", label: "الاثنين" },
    { key: "TUESDAY", label: "الثلاثاء" },
    { key: "WEDNESDAY", label: "الأربعاء" },
    { key: "THURSDAY", label: "الخميس" },
  ];

  const periods = [1, 2, 3, 4, 5, 6];

  // Filter slots for current class & section
  const currentSlots = allSlots.filter(
    (s) => s.classRoomId === selectedClassId && s.sectionId === selectedSectionId
  );

  const openSlotEdit = (dayKey: string, dayLabel: string, periodNumber: number) => {
    const existing = currentSlots.find(
      (s) => s.dayOfWeek === dayKey && s.periodNumber === periodNumber
    );
    setEditingSlot({
      dayOfWeek: dayKey,
      dayLabel,
      periodNumber,
      currentSlot: existing,
    });
    setSelectedSubjectId(existing?.subjectId || subjects[0]?.id || "");
    setSelectedTeacherId(existing?.teacherId || teachers[0]?.id || "");
    setSlotError(null);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !selectedSubjectId || !selectedTeacherId) return;

    setSavingSlot(true);
    setSlotError(null);
    try {
      const res = await saveTimetableSlotAction({
        classRoomId: selectedClassId,
        sectionId: selectedSectionId,
        dayOfWeek: editingSlot.dayOfWeek,
        periodNumber: editingSlot.periodNumber,
        teacherId: selectedTeacherId,
        subjectId: selectedSubjectId,
      });

      if (res.error) {
        setSlotError(res.error);
      } else {
        setEditingSlot(null);
        window.location.reload();
      }
    } catch (e: any) {
      setSlotError(e.message || "حدث خطأ أثناء حفظ الحصة");
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!editingSlot) return;
    if (!confirm("هل أنت متأكد من تفريغ هذه الحصة من الجدول؟")) return;

    setSavingSlot(true);
    try {
      await deleteTimetableSlotAction({
        classRoomId: selectedClassId,
        sectionId: selectedSectionId,
        dayOfWeek: editingSlot.dayOfWeek,
        periodNumber: editingSlot.periodNumber,
      });
      setEditingSlot(null);
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ أثناء الحذف");
    } finally {
      setSavingSlot(false);
    }
  };

  const handleAutoFill = async () => {
    if (
      !confirm(
        `هل تريد ملء وتوزيع جدول صف (${currentClass?.name} - شعبة ${
          currentSections.find((s: any) => s.id === selectedSectionId)?.name
        }) تلقائياً وبشكل ذكي يمنع أي تضارب زمني للمدرسين؟`
      )
    )
      return;

    setGenerating(true);
    try {
      const res = await autoGenerateScheduleAction({
        classRoomId: selectedClassId,
        sectionId: selectedSectionId,
      });

      if (res.error) {
        alert(res.error);
      } else {
        alert(`تم توليد وتوزيع الجدول بنجاح (${res.generatedCount} حصة) بدون أي تضارب!`);
        window.location.reload();
      }
    } catch (e: any) {
      alert(e.message || "خطأ أثناء التوليد التلقائي");
    } finally {
      setGenerating(false);
    }
  };

  const handleClearEntireSchedule = async () => {
    const secName = currentSections.find((s: any) => s.id === selectedSectionId)?.name;
    if (
      !confirm(
        `هل أنت متأكد من رغبتك في تفريغ وحذف جدول صف (${currentClass?.name} - شعبة ${secName}) بالكامل؟`
      )
    )
      return;

    setClearingSchedule(true);
    try {
      const res = await clearEntireClassScheduleAction({
        classRoomId: selectedClassId,
        sectionId: selectedSectionId,
      });
      if (res.success) {
        alert(`تم تفريغ وحذف جدول الصف بنجاح (${res.count} حصة).`);
        window.location.reload();
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ أثناء تفريغ الجدول");
    } finally {
      setClearingSchedule(false);
    }
  };

  const handleSaveLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLeave(true);
    try {
      const res = await createTeacherLeaveAction({
        teacherId: leaveTeacherId,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        reason: leaveReason,
      });

      if (res.success) {
        alert("تم تسجيل إجازة المعلم بنجاح وتحديث كشف الحصص المتأثرة والمقترحات البديلة.");
        setIsLeaveModalOpen(false);
        window.location.reload();
      }
    } catch (e: any) {
      alert(e.message || "خطأ");
    } finally {
      setSavingLeave(false);
    }
  };

  const handleAssignSubstitute = async (
    leaveId: string,
    slot: any,
    subTeacher: any
  ) => {
    const key = `${leaveId}-${slot.id}`;
    setAssigningSub(key);
    try {
      const res = await assignSubstituteTeacherAction({
        leaveId,
        periodNumber: slot.periodNumber,
        classRoomId: slot.classRoomId,
        sectionId: slot.sectionId,
        subjectId: slot.subjectId,
        substituteTeacherId: subTeacher.id,
        substituteTeacherName: subTeacher.fullName,
      });

      if (res.success) {
        alert(`تم تعيين الأستاذ (${subTeacher.fullName}) كمعلم بديل لهذه الحصة بنجاح.`);
        window.location.reload();
      } else {
        alert(res.error || "خطأ");
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setAssigningSub(null);
    }
  };

  // Find if a teacher is currently on leave
  const onLeaveTeacherIds = new Set(teacherLeaves.map((l) => l.teacherId));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            الجدول الأسبوعي والبديل الذكي للمعلمين
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تعديل يدوي تفاعلي للحصص، توليد ذكي مانع للتضارب، وتنبيه تلقائي عند إجازة المعلم لاقتراح البديل المتاح.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الجدول المدرسي</span>
          </button>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>+ تسجيل إجازة معلم واقتراح بديل</span>
          </button>

          <button
            onClick={handleAutoFill}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{generating ? "جاري التوزيع الذكي..." : "ملء وتوزيع الجدول تلقائياً ✨"}</span>
          </button>
        </div>
      </div>

      {/* Teacher Leave & Substitute Suggestion Alert Section */}
      {impacts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-950">
                  تنبيه الإدارة: إجازات المعلمين والحصص المتأثرة اليوم ({impacts.length} معلم مجاز)
                </h3>
                <p className="text-xs text-amber-800">
                  يرجى تغطية الحصص الشاغرة باختيار أحد المدرسين المتفرغين المقترحين أدناه.
                </p>
              </div>
            </div>

            <Badge variant="warning">حالة استثنائية اليوم</Badge>
          </div>

          <div className="space-y-4">
            {impacts.map((imp: any) => (
              <div
                key={imp.leave.id}
                className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      المعلم المجاز: <span className="text-rose-700 font-black">{imp.leave.teacher.fullName}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      (السبب: {imp.leave.reason} — الفترة: {imp.leave.startDate} إلى {imp.leave.endDate})
                    </span>
                  </div>

                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
                    {imp.slotsWithSubstitutes.length} حصص شاغرة اليوم
                  </span>
                </div>

                {/* Impacted Slots & Free Substitutes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imp.slotsWithSubstitutes.map(({ slot, freeTeachers, assignedSubstitute }: any) => {
                    const isSubAssigned = !!assignedSubstitute;

                    return (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-2xl border text-xs space-y-3 transition-all ${
                          isSubAssigned
                            ? "bg-emerald-50/70 border-emerald-300"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                              {slot.periodNumber}
                            </span>
                            <span className="font-black text-slate-900">
                              الحصة {slot.periodNumber}: {slot.subject.name}
                            </span>
                          </div>

                          <span className="text-[11px] font-bold text-slate-600">
                            {slot.classRoom.name} (شعبة {slot.section.name})
                          </span>
                        </div>

                        {isSubAssigned ? (
                          <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold">
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                              <span>تم تعيين البديل: أ. {assignedSubstitute.substituteTeacherName}</span>
                            </div>
                            <span className="text-[10px] text-emerald-600 font-mono">مغطاة بنجاح ✅</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-500 block">
                              المدرسون المتفرغون في هذه الحصة (اقتراح ذكي):
                            </span>

                            {freeTeachers.length === 0 ? (
                              <p className="text-[11px] text-rose-600 font-bold">
                                لا يوجد مدرس متفرغ في هذه الحصة حالياً.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {freeTeachers.slice(0, 4).map((ft: any) => (
                                  <button
                                    key={ft.id}
                                    onClick={() => handleAssignSubstitute(imp.leave.id, slot, ft)}
                                    disabled={assigningSub === `${imp.leave.id}-${slot.id}`}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 shadow-sm ${
                                      ft.teachesSameSubject
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                                        : "bg-white text-slate-800 hover:bg-slate-100 border-slate-300"
                                    }`}
                                  >
                                    <span>{ft.fullName}</span>
                                    {ft.teachesSameSubject && (
                                      <span className="text-[9px] bg-emerald-800 text-emerald-100 px-1.5 py-0.5 rounded-md">
                                        نفس التخصص ⭐
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class & Section Selectors */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">الصف الدراسي</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  const cls = classRooms.find((c) => c.id === e.target.value);
                  if (cls && cls.sections.length > 0) {
                    setSelectedSectionId(cls.sections[0].id);
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 outline-none focus:border-slate-400"
              >
                {classRooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">الشعبة</label>
              <div className="flex items-center gap-2">
                {currentSections.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSectionId(s.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedSectionId === s.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    شعبة ({s.name})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 md:pt-0">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
              {currentSlots.length} / 30 حصة محجوزة
            </span>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              title="معاينة وطباعة جدول هذا الصف"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الجدول</span>
            </button>

            <button
              onClick={handleClearEntireSchedule}
              disabled={clearingSchedule || currentSlots.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all disabled:opacity-40"
              title="حذف وتفريغ جميع حصص هذا الصف"
            >
              {clearingSchedule ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>حذف الجدول الحالي</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-blue-50/70 rounded-2xl text-blue-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            💡 <strong>تعديل الحصص:</strong> اضغط على أي حصة في الجدول لتعديل الأستاذ أو المادة، أو تفريغها. يمنع النظام تلقائياً أي تضارب زمني للأستاذ مع صفوف أخرى.
          </span>
        </div>
      </div>

      {/* Timetable Interactive Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs table-fixed min-w-[760px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-black text-slate-800 text-center w-24">اليوم / الحصة</th>
                {periods.map((p) => (
                  <th key={p} className="p-3.5 font-black text-slate-800 text-center">
                    الحصة {p}
                    {p === 1 && (
                      <span className="block text-[10px] text-emerald-700 font-bold font-sans">
                        (حضور صباحي)
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map((d) => (
                <tr key={d.key} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5 font-black text-slate-900 bg-slate-50/60 border-l border-slate-100 text-center">
                    {d.label}
                  </td>

                  {periods.map((p) => {
                    const slot = currentSlots.find(
                      (s) => s.dayOfWeek === d.key && s.periodNumber === p
                    );
                    const isTeacherOnLeave = slot && onLeaveTeacherIds.has(slot.teacherId);

                    return (
                      <td key={p} className="p-2 text-center align-middle h-20">
                        {slot ? (
                          <div
                            onClick={() => openSlotEdit(d.key, d.label, p)}
                            className={`p-2 rounded-2xl border text-center cursor-pointer hover:shadow-md transition-all space-y-0.5 group relative flex flex-col justify-center h-full ${
                              isTeacherOnLeave
                                ? "bg-rose-50 border-rose-300"
                                : p === 1
                                ? "bg-emerald-50/70 border-emerald-200 hover:border-emerald-400"
                                : "bg-slate-50 border-slate-200/80 hover:border-slate-400"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1 font-black text-slate-900 text-xs">
                              <span className="truncate">{slot.subject.name}</span>
                              <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>

                            <div className="text-[11px] text-slate-600 font-bold truncate">
                              {formatTeacherName(slot.teacher.fullName)}
                            </div>

                            {isTeacherOnLeave && (
                              <span className="inline-block text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-md">
                                ⚠️ إجازة اليوم
                              </span>
                            )}

                            {p === 1 && !isTeacherOnLeave && (
                              <span className="inline-block text-[9px] text-emerald-800 font-bold">
                                (حضور 8:00 ص)
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => openSlotEdit(d.key, d.label, p)}
                            className="w-full h-full min-h-[64px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-300 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold"
                          >
                            <Plus className="w-4 h-4" />
                            <span>فارغة</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Slot Edit Modal */}
      {editingSlot && (
        <Modal
          isOpen={!!editingSlot}
          onClose={() => setEditingSlot(null)}
          title={`تعديل الحصة (${editingSlot.periodNumber}) — يوم ${editingSlot.dayLabel}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveSlot} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600">
              الصف: <strong>{currentClass?.name}</strong> — الشعبة:{" "}
              <strong>
                {currentSections.find((s: any) => s.id === selectedSectionId)?.name}
              </strong>
            </div>

            {slotError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold leading-relaxed flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{slotError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المادة الدراسية *</label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-none focus:border-blue-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المعلم المكلف *</label>
              <select
                required
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-none focus:border-blue-500"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            {editingSlot.periodNumber === 1 && (
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-xs border border-emerald-200">
                ⭐ <strong>تنبيه الحصة الأولى:</strong> سيتولى هذا المعلم رسمياً مسؤولية فتح كشف الحضور الصباحي لهذا الصف وإرسال إشعارات الغياب لولي الأمر.
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {editingSlot.currentSlot ? (
                <button
                  type="button"
                  onClick={handleDeleteSlot}
                  disabled={savingSlot}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تفريغ الحصة</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingSlot}
                  className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-md"
                >
                  {savingSlot ? "جاري الحفظ والتحقق..." : "حفظ الحصة"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Teacher Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="تسجيل إجازة أو غياب معلم واحتساب البديل"
        maxWidth="md"
      >
        <form onSubmit={handleSaveLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المعلم المجاز *</label>
            <select
              required
              value={leaveTeacherId}
              onChange={(e) => setLeaveTeacherId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ البدء *</label>
              <input
                type="date"
                required
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء *</label>
              <input
                type="date"
                required
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">السبب أو الملاحظات *</label>
            <input
              type="text"
              required
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="مثال: إجازة مرضية / ظرف عائلي طارئ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-[11px] leading-relaxed border border-amber-200">
            ⚡ فور الحفظ، سيقوم النظام بالبحث التلقائي عن كافة الحصص المقررة لهذا المعلم، وتحديد المدرسين المتفرغين لنفس التوقيت واقتراحهم للمدير لتغطية الشواغر بنقرة واحدة.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={savingLeave}
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
            >
              {savingLeave ? "جاري الحفظ..." : "تسجيل الإجازة وتحليل البدائل"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Timetable Printable Modal */}
      <TimetablePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        classRoom={currentClass}
        section={currentSections.find((s: any) => s.id === selectedSectionId)}
        slots={allSlots}
        tenant={tenant}
      />
    </div>
  );
};
