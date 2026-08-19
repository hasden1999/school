"use client";

import React, { useState } from "react";
import { Megaphone, Send, Bell, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { createSystemBroadcastAction } from "@/app/actions/superAdminActions";

interface SuperAdminBroadcastClientProps {
  broadcasts: any[];
}

export const SuperAdminBroadcastClient: React.FC<SuperAdminBroadcastClientProps> = ({ broadcasts }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await createSystemBroadcastAction(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 font-cairo text-slate-100 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-2">
          <Megaphone className="w-3.5 h-3.5" />
          <span>مركز التعميمات الموحدة لكافة المدارس</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          إرسال تعميم أو إشعار عام لجميع مدراء المدارس
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
          يصل هذا التعميم فوراً إلى مركز إشعارات كافة مدراء المدارس الأهلية في المنظومة
        </p>
      </div>

      {/* Broadcast Form */}
      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم إرسال التعميم العام ونشره لكافة مدراء المدارس بنجاح! 🚀</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان التعميم / التنبيه</label>
            <input
              type="text"
              name="title"
              required
              placeholder="مثال: تحديث أمني جديد للمنظومة / موعد الصيانة الدورية"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-xs sm:text-sm font-bold text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">مستوى الأهمية</label>
              <select
                name="priority"
                defaultValue="INFO"
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white outline-none"
              >
                <option value="INFO">📢 إعلان عام (معلومات وإرشادات)</option>
                <option value="WARNING">⚠️ تنبيه إداري هام</option>
                <option value="URGENT">🔥 إشعار عاجل وطارئ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">نص الرسالة أو التعميم</label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="اكتب تفاصيل التحديث أو التعليمات الإدارية الموجهة لإدارات المدارس الأهلية..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-xs sm:text-sm font-medium text-white outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? "جاري الإرسال للجميع..." : "بث التعميم فوراً لكافة المدارس 📢"}</span>
          </button>
        </form>
      </div>

      {/* Past Broadcasts */}
      <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800/90 shadow-xl space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <span>سجل التعميمات السابقة</span>
        </h2>

        {broadcasts.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">لم يتم بث أي تعميمات حتى الآن.</p>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-emerald-300">{b.title}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(b.createdAt).toISOString().split("T")[0]}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{b.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
