"use client";

import React, { useState } from "react";
import { processWhatsAppQueueAction } from "@/app/actions/whatsappActions";
import { Badge } from "@/components/ui/Badge";
import {
  MessageSquare,
  Send,
  CheckCheck,
  Clock,
  User,
  Phone,
  Sparkles,
  RefreshCw,
  Search,
} from "lucide-react";

interface WhatsAppCenterClientProps {
  queue: any[];
}

export const WhatsAppCenterClient: React.FC<WhatsAppCenterClientProps> = ({
  queue: initialQueue,
}) => {
  const [queue, setQueue] = useState<any[]>(initialQueue);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState(false);

  const eventLabels: Record<string, string> = {
    ACCOUNT_ACTIVATED: "تفعيل الحساب (بيانات الدخول)",
    MISSING_DOCS: "تذكير مستمسكات ناقصة",
    REPORT_APPROVED: "نشر تقرير دراسي / واجب",
    STUDENT_ABSENT: "تنبيه غياب الطالب اليومي",
    LEAVE_STATUS: "قرار طلب الإجازة",
    PAYMENT_RECEIPT: "وصل استلام قسط مالي",
    PAYMENT_OVERDUE: "تذكير بسداد الأقساط",
    GRADES_PUBLISHED: "إعلان واعتماد الدرجات",
  };

  const filteredQueue = queue.filter((m) => {
    const matchesFilter = filter === "ALL" || m.status === filter;
    const matchesSearch =
      m.recipientName.includes(searchTerm) ||
      m.recipientPhone.includes(searchTerm) ||
      m.messageText.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const res = await processWhatsAppQueueAction();
      alert(`تمت معالجة وإرسال ${res.processedCount} رسالة واتساب بنجاح عبر المحرك.`);
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ أثناء الإرسال");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">مركز أتمتة إشعارات واتساب</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            محرك طابور الرسائل الذكي لجميع أحداث المدرسة التشغيلية الموجهة لأولياء الأمور.
          </p>
        </div>

        <button
          onClick={handleProcess}
          disabled={processing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-black transition-all shadow-md"
        >
          {processing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>إرسال جميع الرسائل المعلقة (Send Queue)</span>
        </button>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-500 font-bold">إجمالي الرسائل</span>
          <h4 className="text-2xl font-black text-slate-800 mt-1">{queue.length}</h4>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs text-amber-600 font-bold">في الانتظار (Queued)</span>
          <h4 className="text-2xl font-black text-amber-600 mt-1">
            {queue.filter((q) => q.status === "QUEUED").length}
          </h4>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs text-emerald-600 font-bold">تم الإرسال (Sent)</span>
          <h4 className="text-2xl font-black text-emerald-600 mt-1">
            {queue.filter((q) => q.status === "SENT").length}
          </h4>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs text-blue-600 font-bold">الأحداث المغطاة</span>
          <h4 className="text-2xl font-black text-blue-600 mt-1">8 أحداث تشغيلية</h4>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المستلم، الرقم، أو نص الرسالة..."
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filter === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter("QUEUED")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filter === "QUEUED" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            بالانتظار
          </button>
          <button
            onClick={() => setFilter("SENT")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filter === "SENT" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            تم الإرسال
          </button>
        </div>
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQueue.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
            لا توجد رسائل في هذا القسم.
          </div>
        ) : (
          filteredQueue.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.recipientName}</h4>
                    <span className="font-mono text-[11px] text-slate-500 block" dir="ltr">
                      {m.recipientPhone}
                    </span>
                  </div>
                </div>

                <Badge variant={m.status === "SENT" ? "success" : "warning"}>
                  {m.status === "SENT" ? "تم الإرسال" : "في الطابور"}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                {m.messageText}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                <span className="font-bold text-emerald-700">
                  🏷️ {eventLabels[m.eventType] || m.eventType}
                </span>
                <span className="font-mono">{new Date(m.createdAt).toLocaleString("ar-IQ")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
