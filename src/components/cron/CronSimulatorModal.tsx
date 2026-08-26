"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { executeCronTaskManually } from "@/app/actions/cronActions";
import { Clock, Play, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

interface CronSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CronSimulatorModal: React.FC<CronSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [lastReport, setLastReport] = useState<any>(null);

  const tasks = [
    {
      id: "LEAVE_8AM",
      name: "حسم الإجازات اليومية (الساعة 8:00 صباحاً)",
      description: "فحص طلبات الإجازة الموافق عليها لليوم الحالي ورصد حالة الطالب 'مجاز' تلقائياً في كشف الحضور.",
      schedule: "يومياً الساعة 8:00 ص",
    },
    {
      id: "ATTENDANCE_9AM",
      name: "تدقيق تسجيل الحضور الصباحي (الساعة 9:00 صباحاً)",
      description: "فحص الصفوف والشعب التي لم يُسجل حضور حصتها الأولى وإرسال تنبيه للإدارة.",
      schedule: "يومياً الساعة 9:00 ص",
    },
    {
      id: "BACKUP_NIGHTLY",
      name: "النسخ الاحتياطي التقني لقاعدة البيانات",
      description: "توليد لقطة بيانات كاملة مشفرة وتخزين سجل النسخة الاحتياطية.",
      schedule: "يومياً ليلاً (12:00 منتصف الليل)",
    },
    {
      id: "OVERDUE_PAYMENTS",
      name: "تذكيرات سداد الأقساط المتأخرة عبر واتساب",
      description: "استخراج الطلاب ذوي الأقساط المتبقية وجدولة رسائل واتساب مهذبة لأولياء الأمور.",
      schedule: "أسبوعياً أو عند الطلب",
    },
  ];

  const handleRunTask = async (taskType: any) => {
    setLoadingTask(taskType);
    setLastReport(null);
    try {
      const res = await executeCronTaskManually(taskType);
      setLastReport(res);
    } catch (e: any) {
      setLastReport({
        taskName: "خطأ",
        executedAt: new Date().toLocaleTimeString("ar-IQ"),
        processedCount: 0,
        details: [e.message || "حدث خطأ أثناء التشغيل"],
        success: false,
      });
    } finally {
      setLoadingTask(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="مشغل ومحاكي المهام المجدولة (Cron Jobs Engine)" maxWidth="2xl">
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 flex items-start gap-3">
          <Clock className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-indigo-800">محرك الأتمتة المجدولة (Background Jobs)</h4>
            <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
              تعمل هذه المهام في الخلفية تلقائياً وفق التوقيتات المحددة بالوثيقة الفنية (مثل حسم الإجازات الساعة 8:00 صباحاً).
              يمكنك هنا تشغيل أي مهمة يدوياً للمعاينة الفورية والتحقق من سير المنطق.
            </p>
          </div>
        </div>

        {/* Task Cards */}
        <div className="space-y-3">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-slate-800">{t.name}</h5>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {t.schedule}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{t.description}</p>
              </div>

              <button
                onClick={() => handleRunTask(t.id)}
                disabled={loadingTask === t.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-300 text-white text-xs font-bold transition-all shadow-sm shrink-0"
              >
                {loadingTask === t.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التنفيذ...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>تشغيل الآن</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Execution Output Box */}
        {lastReport && (
          <div className="p-4 rounded-lg bg-slate-50 text-slate-800 text-xs font-mono border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-brand-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                نتيجة تشغيل: {lastReport.taskName}
              </span>
              <span className="text-slate-500">{lastReport.executedAt}</span>
            </div>
            <p className="text-slate-600">
              عدد السجلات المعالجة: <span className="text-brand-700 font-bold">{lastReport.processedCount}</span>
            </p>
            <div className="space-y-1 pt-1 max-h-36 overflow-y-auto">
              {lastReport.details?.map((line: string, i: number) => (
                <div key={i} className="text-slate-500">
                  › {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
