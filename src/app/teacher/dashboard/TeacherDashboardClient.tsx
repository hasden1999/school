"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  UserCheck,
  Award,
  FileSpreadsheet,
  Calendar,
  Clock,
  Sparkles,
  ChevronLeft,
  GraduationCap,
  Users,
  CheckCircle2,
  CalendarDays,
  Plus,
} from "lucide-react";

interface TeacherDashboardClientProps {
  session: any;
  assignments: any[];
  allWeekSlots: any[];
  todaySlots: any[];
  reports: any[];
  todayKey: string;
}

const DAYS_OF_WEEK = [
  { key: "SUNDAY", label: "الأحد" },
  { key: "MONDAY", label: "الإثنين" },
  { key: "TUESDAY", label: "الثلاثاء" },
  { key: "WEDNESDAY", label: "الأربعاء" },
  { key: "THURSDAY", label: "الخميس" },
];

export const TeacherDashboardClient: React.FC<TeacherDashboardClientProps> = ({
  session,
  assignments,
  allWeekSlots,
  todaySlots,
  reports,
  todayKey,
}) => {
  const [selectedDay, setSelectedDay] = useState(todayKey || "SUNDAY");
  const [activeTab, setActiveTab] = useState<"TIMETABLE" | "CLASSES" | "REPORTS">("TIMETABLE");

  const filteredDaySlots = allWeekSlots
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  const isPeriod1Today = todaySlots.some((s) => s.periodNumber === 1);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900 max-w-7xl mx-auto font-cairo">
      
      {/* 1. Header Hero Banner */}
      <div className="card-surface p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-l from-slate-900 via-emerald-950 to-emerald-900 text-white rounded-3xl shadow-md border-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold backdrop-blur-md">
              🏫 مدرسة المعالي الأهلية الابتدائية المختلطة (تأسست 2017)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/30">
              بوابة المعلم الأكاديمية
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            أهلاً بك يا أستاذ، {session.fullName}!
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            لديك اليوم <strong className="text-white font-bold tabular-nums">{todaySlots.length} حصص تدريسية</strong> | عدد الصفوف المسندة إليك: <strong className="text-white font-bold">{assignments.length} صفوف وشعب</strong>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href="/teacher/attendance"
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer scale-100 hover:scale-105"
          >
            <UserCheck className="w-4 h-4" />
            <span>تسجيل حضور الصباح 📋</span>
          </Link>
          <Link
            href="/teacher/grades"
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer scale-100 hover:scale-105"
          >
            <Award className="w-4 h-4" />
            <span>رصد درجات موادي 📝</span>
          </Link>
        </div>
      </div>

      {/* 2. Fast Navigation Tabs (جدول الحصص | الصفوف المكلف بها | الواجبات والتقارير) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab("TIMETABLE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "TIMETABLE"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>جدول الحصص الأسبوعي واليومي ({allWeekSlots.length} حصة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CLASSES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "CLASSES"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الصفوف والمواد المكلف بها ({assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REPORTS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "REPORTS"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>دفتر اليومية والواجبات ({reports.length})</span>
        </button>
      </div>

      {/* 3. TAB 1: Weekly Timetable Viewer */}
      {activeTab === "TIMETABLE" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Day Selector Pills */}
          <div className="card-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-800" />
              <span className="text-xs font-bold text-slate-900">اختر اليوم لعرض الحصص:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDay === day.key;
                const isToday = todayKey === day.key;
                const count = allWeekSlots.filter((s) => s.dayOfWeek === day.key).length;

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setSelectedDay(day.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    <span>{day.label}</span>
                    {isToday && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-amber-400 text-amber-950" : "bg-emerald-100 text-emerald-800 font-bold"}`}>
                        اليوم
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timetable Period Cards for Selected Day */}
          <div className="card-surface p-6 space-y-4 border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-800" />
                <span>
                  حصص يوم {DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.label} ({filteredDaySlots.length} حصص)
                </span>
              </h3>
              <Link
                href="/teacher/grades"
                className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>رصد درجات هذا اليوم</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {filteredDaySlots.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium text-xs">
                لا توجد حصص مجدولة لك في يوم {DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.label} (يوم حر أو بدون نصاب).
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDaySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 hover:bg-white hover:border-emerald-500 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {slot.periodNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                        الحصة {slot.periodNumber}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{slot.subject.name}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        الصف: <strong className="text-slate-900">{slot.classRoom.name}</strong> — شعبة ({slot.section.name})
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <Link
                        href="/teacher/grades"
                        className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                      >
                        <span>رصد الدرجات ←</span>
                      </Link>

                      {slot.periodNumber === 1 && selectedDay === todayKey && (
                        <Link
                          href="/teacher/attendance"
                          className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px]"
                        >
                          أخذ الحضور 📋
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 2: Assigned Classes and Grade Sheets */}
      {activeTab === "CLASSES" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card-surface p-6 space-y-4 border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-800" />
                  <span>الصفوف والمواد المكلف بتدريسها</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك الدخول مباشرة إلى شيت درجات أي شعبة لرصد الدرجات الشهرية ونصف السنة.
                </p>
              </div>

              <Link
                href="/teacher/grades"
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>فتح شيت الدرجات الموحد</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="card-surface p-5 space-y-3 border border-slate-200 bg-white hover:border-emerald-600 hover:shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-200">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                      شعبة ({a.section.name})
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{a.subject.name}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      الصف: <strong className="text-slate-900">{a.classRoom.name}</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      href="/teacher/grades"
                      className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold text-center transition-colors border border-emerald-200"
                    >
                      رصد الدرجات 📝
                    </Link>
                    <Link
                      href="/teacher/reports"
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      title="كتابة واجب بيتي"
                    >
                      واجب
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: Daily Reports and Homework */}
      {activeTab === "REPORTS" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card-surface p-6 space-y-4 border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-700" />
                  <span>دفتر اليومية والواجبات المنزلية المنشورة</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  الواجبات والدروس التي تنشرها تظهر فوراً في بوابات أولياء الأمور والطلبة.
                </p>
              </div>

              <Link
                href="/teacher/reports"
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة واجب جديد</span>
              </Link>
            </div>

            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-medium text-xs">
                  لا توجد تقارير أو واجبات منشورة مؤخراً. اضغط "إضافة واجب جديد" للبدء.
                </div>
              ) : (
                reports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                      <span className="font-mono text-[11px] text-slate-500">{r.date}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{r.content}</p>
                    {r.homework && (
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-900 font-bold border border-amber-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>الواجب البيتي: {r.homework}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
