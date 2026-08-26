"use client";

import React from "react";
import { Modal } from "../ui/Modal";
import { Printer, Building2, Calendar, Clock, BookOpen, User } from "lucide-react";
import { formatTeacherName } from "@/lib/attendanceLogic";

interface TimetablePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  classRoom: any;
  section: any;
  slots: any[];
  schoolName?: string;
  academicYear?: string;
  tenant?: any;
}

export const TimetablePrintModal: React.FC<TimetablePrintModalProps> = ({
  isOpen,
  onClose,
  classRoom,
  section,
  slots,
  schoolName: initialSchoolName = "مدرسة المعالي الأهلية الابتدائية المختلطة",
  academicYear: initialAcademicYear = "2024-2025",
  tenant,
}) => {
  if (!classRoom || !section) return null;

  const handlePrint = () => {
    window.print();
  };

  const schoolName = tenant?.name || initialSchoolName;
  const schoolLogo = tenant?.logo || null;
  const schoolStamp = tenant?.stampUrl || null;
  const directorName = tenant?.directorName || "إدارة مدرسة المعالي الأهلية";
  const academicYear = tenant?.activeYear || initialAcademicYear;
  const footerText = tenant?.printFooterText || "مدرسة المعالي الأهلية الابتدائية المختلطة (تأسست 2017) — جدول الحصص الأسبوعي الرسمي المعتمد";

  const days = [
    { key: "SUNDAY", label: "الأحد" },
    { key: "MONDAY", label: "الاثنين" },
    { key: "TUESDAY", label: "الثلاثاء" },
    { key: "WEDNESDAY", label: "الأربعاء" },
    { key: "THURSDAY", label: "الخميس" },
  ];

  const periods = [1, 2, 3, 4, 5, 6];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="معاينة وطباعة الجدول الدراسي الرسمي" maxWidth="xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between no-print bg-slate-50 p-4 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-600 font-medium">
            جدول الحصص الأسبوعي الرسمي للصف ({classRoom.name} - شعبة {section.name}).
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-700 text-white hover:bg-brand-800 text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الجدول (PDF / ورقي)</span>
          </button>
        </div>

        {/* Printable Paper Container */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 print-container shadow-md space-y-6 text-slate-900 font-cairo">
          {/* Official Ministry / School Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-300 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                {schoolLogo ? (
                  <img src={schoolLogo} alt="شعار المدرسة" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Building2 className="w-7 h-7" />
                  </div>
                )}
              </div>
              <div className="space-y-0.5 text-right">
                <h4 className="text-[11px] font-bold text-slate-600">جمهورية العراق — وزارة التربية</h4>
                <h3 className="text-base font-bold text-slate-900">{schoolName}</h3>
                <p className="text-[11px] text-slate-500 font-medium">إدارة الشؤون التعليمية والجداول المدرسية</p>
              </div>
            </div>

            <div className="text-left space-y-1">
              <span className="inline-block font-bold text-slate-900 text-xs bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                العام الدراسي: {academicYear}
              </span>
              <div className="text-[11px] font-bold text-slate-700">
                الصف: <span className="text-indigo-900 font-bold">{classRoom.name}</span> — شعبة ({section.name})
              </div>
            </div>
          </div>

          {/* Timetable Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-right text-xs border-collapse table-fixed">
              <thead className="bg-slate-100 text-slate-900 font-bold">
                <tr>
                  <th className="p-2.5 text-center border-l border-slate-300 w-24">اليوم / الحصة</th>
                  {periods.map((p) => (
                    <th key={p} className="p-2.5 text-center border-l border-slate-300 last:border-l-0">
                      الحصة {p}
                      {p === 1 && (
                        <span className="block text-[9px] text-brand-700 font-normal">
                          (حضور 8:00 ص)
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {days.map((d) => (
                  <tr key={d.key} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900 bg-slate-100 border-l border-slate-300 text-center">
                      {d.label}
                    </td>

                    {periods.map((p) => {
                      const slot = slots.find(
                        (s) =>
                          s.classRoomId === classRoom.id &&
                          s.sectionId === section.id &&
                          s.dayOfWeek === d.key &&
                          s.periodNumber === p
                      );

                      return (
                        <td
                          key={p}
                          className="p-2 text-center border-l border-slate-200 last:border-l-0 align-middle h-16"
                        >
                          {slot ? (
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 text-xs block leading-tight">
                                {slot.subject.name}
                              </span>
                              <span className="text-[11px] text-slate-600 font-bold block truncate">
                                {formatTeacherName(slot.teacher.fullName)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Timetable Notes & Stamp */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-300 text-xs">
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500">
                <strong>ملاحظة:</strong> يتولى مدرس الحصة الأولى تسجيل الحضور الصباحي للطلاب يومياً عند بدء الدوام.
              </p>
              <p className="text-slate-500 text-[10px]">{footerText}</p>
            </div>

            <div className="text-center space-y-1">
              <p className="font-bold text-slate-900 text-xs">مدير المدرسة</p>
              <p className="text-[11px] text-slate-700 font-bold">{directorName}</p>
              <div className="h-16 flex items-center justify-center">
                {schoolStamp ? (
                  <img src={schoolStamp} alt="الختم الرسمي" className="h-16 object-contain filter drop-shadow" />
                ) : (
                  <div className="w-20 h-14 rounded-lg border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold">
                    ختم الإدارة
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
