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
    <div className="space-y-6 text-slate-100 font-cairo animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="w-4 h-4" />
            </span>
            <span className="text-xs font-black text-emerald-400">التواصل السحابي المباشر</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">مركز أتمتة إشعارات واتساب</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            محرك طابور الرسائل الذكي لجميع أحداث المدرسة التشغيلية الموجهة لأولياء الأمور.
          </p>
        </div>

        <button
          onClick={handleProcess}
          disabled={processing}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-black transition-all shadow-lg shadow-emerald-950/50"
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
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <span className="text-xs text-slate-400 font-bold">إجمالي الرسائل</span>
          <h4 className="text-2xl font-black text-white mt-1">{queue.length}</h4>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <span className="text-xs text-amber-400 font-bold">في الانتظار (Queued)</span>
          <h4 className="text-2xl font-black text-amber-400 mt-1">
            {queue.filter((q) => q.status === "QUEUED").length}
          </h4>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <span className="text-xs text-emerald-400 font-bold">تم الإرسال (Sent)</span>
          <h4 className="text-2xl font-black text-emerald-400 mt-1">
            {queue.filter((q) => q.status === "SENT").length}
          </h4>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <span className="text-xs text-blue-400 font-bold">الأحداث المغطاة</span>
          <h4 className="text-2xl font-black text-blue-400 mt-1">8 أحداث تشغيلية</h4>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المستلم، الرقم، أو نص الرسالة..."
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-medium outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              filter === "ALL"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter("QUEUED")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              filter === "QUEUED"
                ? "bg-amber-500 text-white shadow-sm shadow-amber-950/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            بالانتظار
          </button>
          <button
            onClick={() => setFilter("SENT")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              filter === "SENT"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-950/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            تم الإرسال
          </button>
        </div>
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQueue.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-slate-900/80 rounded-3xl border border-slate-800 text-slate-400 text-xs font-bold">
            لا توجد رسائل في هذا القسم.
          </div>
        ) : (
          filteredQueue.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{m.recipientName}</h4>
                    <span className="font-mono text-[11px] text-slate-400 block" dir="ltr">
                      {m.recipientPhone}
                    </span>
                  </div>
                </div>

                <Badge variant={m.status === "SENT" ? "success" : "warning"}>
                  {m.status === "SENT" ? "تم الإرسال" : "في الطابور"}
                </Badge>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                {m.messageText}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span className="font-bold text-emerald-400">
                  🏷️ {eventLabels[m.eventType] || m.eventType}
                </span>
                <span className="font-mono text-slate-400">{new Date(m.createdAt).toLocaleString("ar-IQ")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
