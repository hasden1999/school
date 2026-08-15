"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getUserNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/app/actions/notificationActions";
import {
  Bell,
  CheckCheck,
  BookOpen,
  Award,
  CalendarCheck,
  CreditCard,
  UserCheck,
  Sparkles,
  ExternalLink,
  X,
  Clock,
} from "lucide-react";

interface NotificationBellDropdownProps {
  variant?: "light" | "dark";
}

export const NotificationBellDropdown: React.FC<NotificationBellDropdownProps> = ({
  variant = "light",
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await getUserNotificationsAction();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      markNotificationAsReadAction(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "REPORT":
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case "GRADE":
        return <Award className="w-4 h-4 text-purple-600" />;
      case "LEAVE":
        return <CalendarCheck className="w-4 h-4 text-amber-600" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "ATTENDANCE":
        return <UserCheck className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "الآن";
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  const filteredList =
    filter === "UNREAD" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className={`relative p-2 sm:p-2.5 rounded-xl transition-all ${
          variant === "dark"
            ? "text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700"
            : "text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm"
        }`}
        title="الإشعارات والتنبيهات"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center animate-pulse border-2 border-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 max-w-[92vw] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">مركز الإشعارات</h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {unreadCount > 0 ? `${unreadCount} إشعار جديد بانتظارك` : "لا توجد إشعارات جديدة"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                title="تحديد جميع الإشعارات كمقروءة"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>قراءة الكل</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filter === "ALL"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                الكل ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("UNREAD")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filter === "UNREAD"
                    ? "bg-rose-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                غير مقروءة ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                <p>📭 لا توجد إشعارات لعرضها حالياً</p>
              </div>
            ) : (
              filteredList.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 text-right transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                    !notif.isRead ? "bg-emerald-50/40 font-medium" : "bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-black text-slate-900 line-clamp-1">
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-1">
                        <span>انقر للمعاينة</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5 shadow-sm"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
