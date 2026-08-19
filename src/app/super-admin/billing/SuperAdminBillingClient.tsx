"use client";

import React, { useState } from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  FileSpreadsheet,
} from "lucide-react";

interface SuperAdminBillingClientProps {
  payments: any[];
}

export const SuperAdminBillingClient: React.FC<SuperAdminBillingClientProps> = ({ payments }) => {
  const [search, setSearch] = useState("");

  const filteredPayments = payments.filter((p) => {
    return (
      p.tenant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.paymentMethod?.toLowerCase().includes(search.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (p.recordedBy && p.recordedBy.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-8 font-cairo text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>سجل الإيرادات والاشتراكات لمالك المنظومة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            سجل المقبوضات والاشتراكات السحابية
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            توثيق كامل لكافة الدفعات المحصلة من المدارس المشتركة (زين كاش، نقدي، حوالات)
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-emerald-500/30 flex items-center gap-4 shadow-xl shadow-emerald-500/5">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-400">إجمالي المقبوضات المسجلة</span>
            <h3 className="text-2xl font-black text-white">${totalCollected} USD</h3>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-black text-white">جدول الدفعات والفواتير السحابية</h2>
          </div>

          <div className="relative min-w-[260px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالمدرسة، طريقة الدفع، رقم الحوالة..."
              className="w-full pl-4 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-xs font-medium text-white outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">المدرسة المشتركة</th>
                <th className="p-4">المبلغ والعملة</th>
                <th className="p-4">طريقة الاستلام</th>
                <th className="p-4">رقم الإشعار / الحوالة</th>
                <th className="p-4">المدة والتجديد</th>
                <th className="p-4">التاريخ والمسؤول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                    لا توجد دفعات مسجلة حتى الآن
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* School */}
                    <td className="p-4">
                      <div className="font-black text-white">{payment.tenant?.name || "مدرسة غير معروفة"}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{payment.tenant?.code}</span>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <span className="font-black text-emerald-400 text-sm">
                        ${payment.amount} {payment.currency}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200">
                        {payment.paymentMethod === "ZAIN_CASH" && "📱 زين كاش"}
                        {payment.paymentMethod === "ASIA_HAWALA" && "📱 آسيا حوالة"}
                        {payment.paymentMethod === "BANK_TRANSFER" && "🏦 تحويل مصرفي"}
                        {payment.paymentMethod === "CASH" && "💵 نقدي"}
                        {payment.paymentMethod === "DIRECT" && "⚡ دفع إلكتروني مباشر"}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="p-4 font-mono text-slate-300">
                      {payment.referenceNumber ? (
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          {payment.referenceNumber}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Duration */}
                    <td className="p-4">
                      <span className="font-bold text-teal-300 text-xs">
                        +{payment.durationMonths} {payment.durationMonths === 1 ? "شهر" : "أشهر"}
                      </span>
                      {payment.notes && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{payment.notes}</div>
                      )}
                    </td>

                    {/* Date & Recorded By */}
                    <td className="p-4">
                      <div className="text-slate-200 font-mono text-[11px]">
                        {new Date(payment.createdAt).toISOString().split("T")[0]}
                      </div>
                      <div className="text-[10px] text-slate-400">بواسطة: {payment.recordedBy || "Super Admin"}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
