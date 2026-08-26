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
    <div className="space-y-8 font-cairo text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100 text-xs font-bold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>سجل الإيرادات والاشتراكات لمالك المنظومة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            سجل المقبوضات والاشتراكات السحابية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            توثيق كامل لكافة الدفعات المحصلة من المدارس المشتركة (زين كاش، نقدي، حوالات)
          </p>
        </div>

        <div className="card-surface p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-brand-700">إجمالي المقبوضات المسجلة</span>
            <h3 className="text-2xl font-bold tabular-nums text-slate-900">${totalCollected} USD</h3>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card-surface overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-700" />
            <h2 className="text-base font-bold text-slate-900">جدول الدفعات والفواتير السحابية</h2>
          </div>

          <div className="relative min-w-[260px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالمدرسة، طريقة الدفع، رقم الحوالة..."
              className="w-full pl-4 pr-9 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="p-4">المدرسة المشتركة</th>
                <th className="p-4">المبلغ والعملة</th>
                <th className="p-4">طريقة الاستلام</th>
                <th className="p-4">رقم الإشعار / الحوالة</th>
                <th className="p-4">المدة والتجديد</th>
                <th className="p-4">التاريخ والمسؤول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                    لا توجد دفعات مسجلة حتى الآن
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    {/* School */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{payment.tenant?.name || "مدرسة غير معروفة"}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{payment.tenant?.code}</span>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <span className="font-bold text-brand-700 text-sm tabular-nums">
                        ${payment.amount} {payment.currency}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
                        {payment.paymentMethod === "ZAIN_CASH" && "زين كاش"}
                        {payment.paymentMethod === "ASIA_HAWALA" && "آسيا حوالة"}
                        {payment.paymentMethod === "BANK_TRANSFER" && "تحويل مصرفي"}
                        {payment.paymentMethod === "CASH" && "نقدي"}
                        {payment.paymentMethod === "DIRECT" && "دفع إلكتروني مباشر"}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="p-4 font-mono text-slate-600">
                      {payment.referenceNumber ? (
                        <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600">
                          {payment.referenceNumber}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Duration */}
                    <td className="p-4">
                      <span className="font-bold text-teal-700 text-xs">
                        +{payment.durationMonths} {payment.durationMonths === 1 ? "شهر" : "أشهر"}
                      </span>
                      {payment.notes && (
                        <div className="text-[10px] text-slate-500 mt-0.5">{payment.notes}</div>
                      )}
                    </td>

                    {/* Date & Recorded By */}
                    <td className="p-4">
                      <div className="text-slate-700 font-mono text-[11px]">
                        {new Date(payment.createdAt).toISOString().split("T")[0]}
                      </div>
                      <div className="text-[10px] text-slate-500">بواسطة: {payment.recordedBy || "Super Admin"}</div>
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
