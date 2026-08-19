"use client";

import React, { useEffect, useState } from "react";
import { Download, Smartphone, X, CheckCircle2, Share } from "lucide-react";

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register service worker with auto-update
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Check for SW updates every 30 minutes
          setInterval(() => reg.update(), 30 * 60 * 1000);
        })
        .catch((err) => {
          console.log("Service Worker registration failed:", err);
        });
    }

    // 2. Request persistent storage (critical for multi-day offline)
    // Without this, browser may auto-evict IndexedDB data
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((granted) => {
        if (granted) {
          console.log("✅ Persistent storage granted - data safe for offline use");
        } else {
          console.warn("⚠️ Persistent storage denied - data may be cleared by browser");
        }
      });
    }

    // 2. Check if already installed / running in standalone mode
    const isApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isApp) {
      setIsStandalone(true);
      return;
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Capture install prompt on Android/Windows/Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed recently
      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS and not dismissed, show guide
    if (isIosDevice && !localStorage.getItem("pwa_prompt_dismissed")) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slideUp font-cairo">
      <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 p-4 sm:p-5 rounded-3xl shadow-2xl shadow-black/80 space-y-3 text-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0 border border-emerald-400/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">تثبيت تطبيق المنظومة</h4>
              <p className="text-xs text-slate-300">
                لتسهيل الوصول اليومي بدون متصفح وكأنه تطبيق رسمي
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Share className="w-3.5 h-3.5" />
              <span>طريقة التثبيت على أجهزة iPhone / iPad:</span>
            </div>
            <p className="leading-relaxed">
              اضغط على زر <span className="font-bold text-white">المشاركة (Share ⎋)</span> أسفل الشاشة، ثم اختر <span className="font-bold text-emerald-300">"إضافة إلى الصفحة الرئيسية (Add to Home Screen)"</span>.
            </p>
          </div>
        ) : (
          <div className="pt-1">
            <button
              onClick={handleInstallClick}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت أيقونة التطبيق على الجهاز الآن 📱</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
