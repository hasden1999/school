"use client";

import React, { useState, useEffect } from "react";
import { getSchoolNetworkAccessAction } from "@/app/actions/networkActions";
import { LocalNetworkInfo } from "@/lib/server/localNetwork";
import {
  Wifi,
  QrCode,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Radio,
  X,
  RefreshCw,
  Share2,
  ShieldCheck,
} from "lucide-react";

interface SchoolNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolNetworkModal: React.FC<SchoolNetworkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [networkInfo, setNetworkInfo] = useState<LocalNetworkInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const res = await getSchoolNetworkAccessAction();
      if (res.success && res.network) {
        setNetworkInfo(res.network);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInfo();
    }
  }, [isOpen]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn font-cairo">
      <div className="card-surface shadow-pop max-w-lg w-full overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-100">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>بث شبكة المدرسة الداخلية (Wi-Fi Hub)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-50 text-brand-700 border border-brand-100">
                  شبكة محلية نشطة
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ربط هواتف ولابتوبات المعلمين بحاسبة المدرسة بدون إنترنت.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-xs font-bold">جاري قراءة بطاقات شبكة المدرسة...</span>
            </div>
          ) : (
            <>
              {/* QR Code Card */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
                  {networkInfo?.qrCodeDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={networkInfo.qrCodeDataUrl}
                      alt="School Wi-Fi Access QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <QrCode className="w-36 h-36 text-slate-400" />
                  )}
                </div>

                <div className="space-y-2 text-right">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>مسح مباشر بكاميرا الهاتف</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    اطلب من المعلمين الاتصال بـ <b>واي فاي المدرسة</b> ثم فتح كاميرا الهاتف ومسح هذا الرمز ليفتح معهم النظام فوراً وبسرعة فائقة.
                  </p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
                    يعمل بدون إنترنت (داخل نطاق الراوتر)
                  </span>
                </div>
              </div>

              {/* Network Direct URL Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  أو كتابة رابط السيرفر المباشر في المتصفح:
                </label>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs">
                  <span className="flex-1 px-2 select-all truncate text-brand-700">
                    {networkInfo?.loginUrl || "http://192.168.1.X:3000/login"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(networkInfo?.loginUrl || "http://127.0.0.1:3000/login")
                    }
                    className="p-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white flex items-center gap-1 text-[11px] font-bold transition-all shrink-0 font-cairo"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span className="text-white">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions Steps */}
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 space-y-2 text-xs text-indigo-900">
                <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>خطوات الاستخدام اليومي في المدرسة:</span>
                </span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 font-medium pr-1">
                  <li>تأكد من تشغيل حاسبة الإدارة والراوتر في المدرسة.</li>
                  <li>يتصل المعلم بشبكة واي فاي المدرسة من هاتفه أو حاسوبه.</li>
                  <li>يمسح رمز QR أعلاه لتسجيل الحضور، رصد الدرجات، واستعراض الشعب.</li>
                  <li>كافة البيانات تُسجل مركزياً في حاسبة الإدارة وتتزامن سحابياً فور توفر النت.</li>
                </ol>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={fetchInfo}
            className="flex items-center gap-1.5 text-indigo-700 hover:text-indigo-800 font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث عنوان الشبكة</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-brand-700 text-white font-bold hover:bg-brand-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
