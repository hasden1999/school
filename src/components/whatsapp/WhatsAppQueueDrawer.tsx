"use client";

import React, { useState, useEffect } from "react";
import { getWhatsAppQueueList, processWhatsAppQueueAction } from "@/app/actions/whatsappActions";
import {
  MessageSquare,
  X,
  Send,
  CheckCheck,
  Clock,
  User,
  Phone,
  RefreshCw,
} from "lucide-react";

interface WhatsAppQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppQueueDrawer: React.FC<WhatsAppQueueDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getWhatsAppQueueList(filter);
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchQueue();
  }, [isOpen, filter]);

  const handleProcessQueue = async () => {
    setProcessing(true);
    try {
      await processWhatsAppQueueAction();
      await fetchQueue();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-fadeIn flex justify-start">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black">طابور رسائل واتساب</h3>
              <p className="text-xs text-emerald-100 font-medium">مركز أتمتة إشعارات أولياء الأمور</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                filter === "ALL" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter("QUEUED")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                filter === "QUEUED" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              بالانتظار
            </button>
            <button
              onClick={() => setFilter("SENT")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                filter === "SENT" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              المُرسلة
            </button>
          </div>

          <button
            onClick={handleProcessQueue}
            disabled={processing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-bold transition-colors shadow-sm"
          >
            {processing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>إرسال المعلق</span>
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/50">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">جاري تحميل الرسائل...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">لا توجد رسائل في هذا الطابور حالياً.</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {msg.recipientName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      msg.status === "SENT"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {msg.status === "SENT" ? (
                      <>
                        <CheckCheck className="w-3 h-3 text-emerald-600" />
                        تم الإرسال
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-600" />
                        في الطابور
                      </>
                    )}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span dir="ltr">{msg.recipientPhone}</span>
                </div>

                {/* Message Bubble Preview */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {msg.messageText}
                </div>

                <div className="text-[10px] text-slate-400 text-left pt-1">
                  {new Date(msg.createdAt).toLocaleString("ar-IQ")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
