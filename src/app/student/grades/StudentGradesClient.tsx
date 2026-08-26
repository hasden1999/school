"use client";

import React, { useState } from "react";
import { StudentReportCardModal } from "@/components/print/StudentReportCardModal";
import {
  Award,
  Printer,
  BookOpen,
} from "lucide-react";

interface StudentGradesClientProps {
  student: any;
}

export const StudentGradesClient: React.FC<StudentGradesClientProps> = ({ student }) => {
  const [activeTab, setActiveTab] = useState<"term1" | "midYear" | "term2" | "annual">("term1");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const gradeRecords = student?.gradeRecords || [];

  return (
    <div className="space-y-6 text-slate-900 font-cairo animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-surface p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-700">النتائج والشهادات الوزارية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">سجل درجاتي وشهادتي الرسمية</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            النتائج المرحلية الرسمية المعتمدة للفصول والامتحانات والسعي السنوي.
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>عرض وطباعة بطاقة الدرجات الرسمية (PDF)</span>
        </button>
      </div>

      {/* Phased Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-xs w-fit flex-wrap">
        <button
          onClick={() => setActiveTab("term1")}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
            activeTab === "term1"
              ? "bg-brand-700 text-white"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          الفصل الأول (ش 1 + ش 2)
        </button>
        <button
          onClick={() => setActiveTab("midYear")}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
            activeTab === "midYear"
              ? "bg-brand-700 text-white"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          امتحان نصف السنة
        </button>
        <button
          onClick={() => setActiveTab("term2")}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
            activeTab === "term2"
              ? "bg-brand-700 text-white"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          الفصل الثاني (ش 3 + ش 4)
        </button>
        <button
          onClick={() => setActiveTab("annual")}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
            activeTab === "annual"
              ? "bg-brand-700 text-white"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          السعي السنوي والدرجة النهائية
        </button>
      </div>

      {/* Grades Cards Matrix for Active Tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {gradeRecords.map((g: any) => {
          return (
            <div
              key={g.id}
              className="card-surface p-6 space-y-4 hover:border-brand-200 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{g.subject.name}</h3>
                  </div>
                </div>

                {/* Tab Specific Content */}
                {activeTab === "term1" && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">الشهر الأول:</span>
                      <span className="font-bold text-slate-900">
                        {g.month1 !== null ? `${g.month1} / 100` : "لم تُرصد بعد"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">الشهر الثاني:</span>
                      <span className="font-bold text-slate-900">
                        {g.month2 !== null ? `${g.month2} / 100` : "لم تُرصد بعد"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-brand-700">
                      <span>سعي الفصل الأول:</span>
                      <span className="text-sm font-bold">
                        {g.term1Average !== null ? `${g.term1Average}` : "قيد الاحتساب"}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "midYear" && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-bold">درجة امتحان نصف السنة:</span>
                      <span className="font-bold text-blue-700 text-base">
                        {g.midYear !== null ? `${g.midYear} / 100` : "لم تُرصد بعد"}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "term2" && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">الشهر الثالث:</span>
                      <span className="font-bold text-slate-900">
                        {g.month3 !== null ? `${g.month3} / 100` : "لم تُرصد بعد"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">الشهر الرابع:</span>
                      <span className="font-bold text-slate-900">
                        {g.month4 !== null ? `${g.month4} / 100` : "لم تُرصد بعد"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-brand-700">
                      <span>سعي الفصل الثاني:</span>
                      <span className="text-sm font-bold">
                        {g.term2Average !== null ? `${g.term2Average}` : "قيد الاحتساب"}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "annual" && (
                  <div className="p-4 rounded-lg bg-brand-50 border border-brand-100 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-700 font-bold">السعي السنوي المعتمد:</span>
                      <span className="font-bold text-amber-700 text-sm">
                        {g.annualAverage !== null ? `${g.annualAverage}` : "قيد الاحتساب"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-700 font-bold">الامتحان النهائي:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {g.finalExam !== null ? `${g.finalExam}` : "لم تُرصد بعد"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-brand-100 text-brand-800 font-bold">
                      <span>الدرجة النهائية:</span>
                      <span className="text-base text-brand-700">
                        {g.finalGrade !== null ? `${g.finalGrade} / 100` : "بانتظار النهائي"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Report Card Modal */}
      <StudentReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        student={student}
      />
    </div>
  );
};
