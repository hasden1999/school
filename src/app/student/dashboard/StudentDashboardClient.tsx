"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FolderLock,
  Calendar,
  Sparkles,
  Crown,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronLeft,
  CalendarDays,
  Percent,
} from "lucide-react";

interface StudentDashboardClientProps {
  session: any;
  profile: any;
  allWeekSlots: any[];
  todaySlots: any[];
  recentReports: any[];
  totalPaid: number;
  remainingTuition: number;
  schoolPhone: string;
  isClassRep: boolean;
  canViewClassGrades: boolean;
  todayKey: string;
}

const DAYS_OF_WEEK = [
  { key: "SUNDAY", label: "الأحد" },
  { key: "MONDAY", label: "الإثنين" },
  { key: "TUESDAY", label: "الثلاثاء" },
  { key: "WEDNESDAY", label: "الأربعاء" },
  { key: "THURSDAY", label: "الخميس" },
];

export const StudentDashboardClient: React.FC<StudentDashboardClientProps> = ({
  session,
  profile,
  allWeekSlots,
  todaySlots,
  recentReports,
  totalPaid,
  remainingTuition,
  schoolPhone,
  isClassRep,
  canViewClassGrades,
  todayKey,
}) => {
  const [selectedDay, setSelectedDay] = useState(todayKey || "SUNDAY");
  const [activeTab, setActiveTab] = useState<"HOME" | "SCHEDULE" | "GRADES" | "TUITION">("HOME");

  const filteredDaySlots = allWeekSlots
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  const gradeRecords = profile?.gradeRecords || [];

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900 max-w-7xl mx-auto font-cairo">
      
      {/* 1. Hero Institutional Banner */}
      <div className="card-surface p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl shadow-md border-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold backdrop-blur-md">
              🏫 مدرسة المعالي الأهلية الابتدائية المختلطة (تأسست 2017)
            </span>
            {isClassRep && (
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black flex items-center gap-1 shadow-xs">
                <Crown className="w-3.5 h-3.5" />
                <span>كابتن وممثل الشعبة 👑</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            أهلاً بك يا بطل، {session.fullName}!
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            الصف: <strong className="text-white font-bold">{profile.classRoom?.name}</strong> — الشعبة: <strong className="text-white font-bold">({profile.section?.name})</strong> | الرقم المدرسي: <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{profile.studentNumber}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href="/student/grades"
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer scale-100 hover:scale-105"
          >
            <Award className="w-4 h-4" />
            <span>شهاداتي ونتائجي 🏆</span>
          </Link>
          <Link
            href="/student/leaves"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 backdrop-blur-md cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-200" />
            <span>طلب إجازة مرضية</span>
          </Link>
        </div>
      </div>

      {/* 2. Navigation Pills for Student Hub */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab("HOME")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "HOME"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>ملخص الطالب واليوم</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SCHEDULE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "SCHEDULE"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>جدول الحصص الأسبوعي ({allWeekSlots.length} حصة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("GRADES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "GRADES"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>كشف الدرجات الأكاديمية ({gradeRecords.length} مواد)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TUITION")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "TUITION"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>الأقساط والوصولات المالية</span>
        </button>
      </div>

      {/* 3. TAB 1: Main Student Summary */}
      {activeTab === "HOME" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Four Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action 1: Grades */}
            <Link
              href="/student/grades"
              className="card-surface p-5 space-y-3 hover:border-emerald-600 hover:shadow-md transition-all group border border-slate-200 bg-white cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
                  درجاتي وشهادتي الرسمية
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  استعرض شيت الدرجات والامتحانات ولوحة تنافس الصف.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-emerald-700 gap-1 pt-1">
                <span>فتح السجل</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </Link>

            {/* Action 2: Tuition */}
            <Link
              href="/student/payments"
              className="card-surface p-5 space-y-3 hover:border-emerald-600 hover:shadow-md transition-all group border border-slate-200 bg-white cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
                  حساباتي والأقساط
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  المسدد: {Number(totalPaid).toLocaleString()} د.ع | المتبقي: {Number(remainingTuition).toLocaleString()} د.ع
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-emerald-700 gap-1 pt-1">
                <span>عرض الوصلات</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </Link>

            {/* Action 3: Timetable */}
            <button
              type="button"
              onClick={() => setActiveTab("SCHEDULE")}
              className="card-surface p-5 space-y-3 hover:border-blue-600 hover:shadow-md transition-all group border border-slate-200 bg-white text-right cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                  جدول دروس الأسبوع
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  حصص الصف من الأحد للخميس مع أسماء الأساتذة.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-blue-700 gap-1 pt-1">
                <span>عرض الجدول الأسبوعي</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </button>

            {/* Action 4: WhatsApp Support */}
            <a
              href={`https://wa.me/${schoolPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `السلام عليكم إدارة مدرسة المعالي، أنا ولي أمر الطالب/ة (${session.fullName}) من الصف (${profile.classRoom?.name} - ${profile.section?.name}). لدي استفسار:`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card-surface p-5 space-y-3 hover:border-emerald-600 hover:shadow-md transition-all group border border-emerald-200 bg-emerald-50/40 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  تحدث مع الإدارة
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  تواصل مباشر عبر الواتساب للاستفسارات والطلبات.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-emerald-800 gap-1 pt-1">
                <span>إرسال رسالة</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </a>
          </div>

          {/* Today's Classes & Recent Homework */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
            <div className="card-surface p-6 space-y-4 border border-slate-200 bg-white">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-700" />
                <span>حصص اليوم ({todaySlots.length} حصص)</span>
              </h3>

              <div className="space-y-2.5">
                {todaySlots.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">لا توجد حصص مسجلة في هذا اليوم (عطلة أو يوم حر).</p>
                ) : (
                  todaySlots.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center shadow-2xs">
                          {s.periodNumber}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{s.subject?.name}</h4>
                          <span className="text-xs text-slate-600 font-medium">الأستاذ: {s.teacher?.fullName}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                        الحصة {s.periodNumber}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Homework */}
            <div className="card-surface p-6 space-y-4 border border-slate-200 bg-white">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-700" />
                <span>الواجبات والدروس اليومية المطلوبة</span>
              </h3>

              <div className="space-y-3">
                {recentReports.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">لا توجد واجبات جديدة منشورة اليوم.</p>
                ) : (
                  recentReports.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{r.subject?.name}: {r.title}</span>
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
        </div>
      )}

      {/* 4. TAB 2: Full Weekly Timetable */}
      {activeTab === "SCHEDULE" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Day Selector */}
          <div className="card-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-800" />
              <span className="text-xs font-bold text-slate-900">اختر يوم الأسبوع:</span>
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

          {/* Schedule Period Cards */}
          <div className="card-surface p-6 space-y-4 border border-slate-200 bg-white">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-emerald-800" />
              <span>
                جدول حصص يوم {DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.label} ({filteredDaySlots.length} حصص)
              </span>
            </h3>

            {filteredDaySlots.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium text-xs">
                لا توجد حصص مسجلة لشعبتك في يوم {DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.label}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDaySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-white hover:border-emerald-500 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                        {slot.periodNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                        الحصة {slot.periodNumber}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{slot.subject?.name}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        الأستاذ: <strong className="text-slate-900">{slot.teacher?.fullName}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 3: Academic Grades Roster */}
      {activeTab === "GRADES" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card-surface p-6 space-y-4 border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>سجل درجاتي في المواد الدراسية</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  الدرجات المعتمدة من أساتذة المواد وإدارة المدرسة.
                </p>
              </div>

              <Link
                href="/student/grades"
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black transition-all shadow-xs flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>عرض الشهادة الكاملة 🏆</span>
              </Link>
            </div>

            {gradeRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium text-xs">
                لم يتم رصد درجات للمواد بعد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">المادة الدراسية</th>
                      <th className="p-3 text-center">شهر 1</th>
                      <th className="p-3 text-center">شهر 2</th>
                      <th className="p-3 text-center">نصف السنة</th>
                      <th className="p-3 text-center">شهر 3</th>
                      <th className="p-3 text-center">شهر 4</th>
                      <th className="p-3 text-center">النهائي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gradeRecords.map((g: any) => (
                      <tr key={g.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{g.subject?.name}</td>
                        <td className="p-3 text-center font-bold font-mono">{g.month1 ?? "—"}</td>
                        <td className="p-3 text-center font-bold font-mono">{g.month2 ?? "—"}</td>
                        <td className="p-3 text-center font-bold font-mono text-emerald-800 bg-emerald-50/50">{g.midYear ?? "—"}</td>
                        <td className="p-3 text-center font-bold font-mono">{g.month3 ?? "—"}</td>
                        <td className="p-3 text-center font-bold font-mono">{g.month4 ?? "—"}</td>
                        <td className="p-3 text-center font-bold font-mono text-amber-900 bg-amber-50/50">{g.finalExam ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 4: Financial Tuition */}
      {activeTab === "TUITION" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card-surface p-6 space-y-4 border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-800" />
                  <span>موقف القسط المدرسي والوصولات</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  المبالغ المسددة والمتبقية من القسط السنوي.
                </p>
              </div>

              <Link
                href="/student/payments"
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                عرض سجل الوصولات الكامل 🧾
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block">إجمالي القسط السنوي:</span>
                <strong className="text-lg font-bold text-slate-900 font-mono mt-1 block">
                  {Number(profile.totalTuition).toLocaleString()} د.ع
                </strong>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-800 block">المبلغ المسدد:</span>
                <strong className="text-lg font-bold text-emerald-900 font-mono mt-1 block">
                  {Number(totalPaid).toLocaleString()} د.ع
                </strong>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-800 block">المبلغ المتبقي:</span>
                <strong className={`text-lg font-bold font-mono mt-1 block ${remainingTuition > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                  {remainingTuition > 0 ? `${Number(remainingTuition).toLocaleString()} د.ع` : "مسدد بالكامل ✅"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
