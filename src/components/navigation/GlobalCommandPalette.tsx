"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  GraduationCap,
  Users,
  Award,
  CalendarCheck,
  CreditCard,
  Calendar,
  FileSpreadsheet,
  Settings,
  Database,
  MessageSquare,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "طالب" | "صف" | "قسم" | "معلم" | "إجراء سريع";
  url: string;
  icon: any;
}

const STATIC_MODULES: SearchItem[] = [
  { id: "mod-dashboard", title: "لوحة التحكم الرئيسية", subtitle: "المؤشرات العامة والعمليات اليومية", category: "قسم", url: "/admin/dashboard", icon: Sparkles },
  { id: "mod-attendance", title: "تسجيل الحضور والغياب الصباحي", subtitle: "حصر الغياب الصباحي للحصة 1", category: "إجراء سريع", url: "/admin/attendance", icon: CalendarCheck },
  { id: "mod-grades", title: "سجل الدرجات والشهادات الرسمية", subtitle: "رصد درجات الأشهر، السعي السنوي، وطباعة الشهادات", category: "قسم", url: "/admin/grades", icon: Award },
  { id: "mod-students", title: "سجل الطلاب والمستمسكات", subtitle: "إدارة قيود الطلاب، الوثائق، وتفعيل الحسابات", category: "قسم", url: "/admin/students", icon: GraduationCap },
  { id: "mod-payments", title: "الأقساط والوصولات المالية", subtitle: "تحصيل الدفعات وإصدار وصولات القبض الرسمية", category: "إجراء سريع", url: "/admin/payments", icon: CreditCard },
  { id: "mod-schedule", title: "الجدول الدراسي الأسبوعي", subtitle: "توزيع الحصص الأسبوعية وتوليد الجداول آلياً", category: "قسم", url: "/admin/schedule", icon: Calendar },
  { id: "mod-reports", title: "التقارير اليومية والواجبات", subtitle: "مراجعة واعتماد تقارير المعلمين اليومية", category: "قسم", url: "/admin/reports", icon: FileSpreadsheet },
  { id: "mod-teachers", title: "كادر المعلمين والأنصبة", subtitle: "إدارة الهيئة التعليمية وتوزيع المواد والحصص", category: "قسم", url: "/admin/teachers", icon: Users },
  { id: "mod-leaves", title: "طلبات إجازات الطلاب", subtitle: "الموافقة على الإجازات وربطها التلقائي بالحضور", category: "قسم", url: "/admin/leaves", icon: CalendarCheck },
  { id: "mod-whatsapp", title: "طابور إشعارات واتساب", subtitle: "متابعة الرسائل التلقائية المرسلة لأولياء الأمور", category: "قسم", url: "/admin/whatsapp", icon: MessageSquare },
  { id: "mod-backup", title: "النسخ الاحتياطي وحزمة الطوارئ", subtitle: "تنزيل تطبيق الطوارئ الأوفلاين وجداول Excel الكاملة", category: "إجراء سريع", url: "/admin/backup", icon: Database },
  { id: "mod-settings", title: "إعدادات وهوية المدرسة", subtitle: "تعديل الشعار، الختم الرسمي، وبيانات المدرسة المطبوعة", category: "إجراء سريع", url: "/admin/settings", icon: Settings },
];

export const GlobalCommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const filteredItems = query.trim()
    ? STATIC_MODULES.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : STATIC_MODULES;

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  return (
    <>
      {/* Quick Search Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 text-xs font-bold transition-all border border-slate-200 shadow-inner group"
      >
        <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-700 transition-colors" />
        <span className="hidden sm:inline">بحث وانتقال سريع...</span>
        <span className="inline sm:hidden">بحث...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] bg-slate-100 border border-slate-300 rounded-md px-1.5 py-0.5 font-mono text-slate-500">
          Ctrl + K
        </kbd>
      </button>

      {/* Floating Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 animate-fadeIn">
          <div
            className="w-full max-w-2xl card-surface shadow-pop overflow-hidden text-right font-cairo animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اكتب اسم القسم، الإجراء (مثال: درجات، حضور، أقساط، إعدادات)..."
                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 border border-slate-300 px-2 py-1 rounded-lg"
              >
                Esc
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  لم يتم العثور على نتائج مطابقة لـ "{query}"
                </div>
              ) : (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.url)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 transition-all text-right group border border-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-brand-50 group-hover:text-brand-800 text-slate-700 flex items-center justify-center transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-800">
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-brand-50 group-hover:text-brand-700 text-slate-600 px-2 py-0.5 rounded-full">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 rotate-180 transition-transform group-hover:-translate-x-1" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>اضغط على أي خيار للانتقال المباشر للقسم المطلوب</span>
              <span className="font-mono text-[10px]">نظام الإدارة المدرسية المتكامل</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
