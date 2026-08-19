"use client";

import React, { useState, useEffect } from "react";
import { DashboardClient } from "./DashboardClient";
import { fetchDashboardDataAction } from "@/app/actions/dataFetchActions";
import { getSchoolCache, getAllRecords } from "@/lib/offline/offlineDB";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const isOnline = typeof window !== "undefined" && navigator.onLine;

      if (isOnline) {
        try {
          const res: any = await fetchDashboardDataAction();
          if (res.success) {
            setData(res);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Failed to fetch dashboard data online:", err);
        }
      }

      // Offline fallback: construct dashboard data from IndexedDB
      try {
        const cached = await getSchoolCache();
        const students = await getAllRecords<any>("students");
        const teachers = await getAllRecords<any>("teachers");

        setData({
          school: cached ? { name: cached.schoolName, currency: cached.currency } : null,
          session: { fullName: "مدير النظام", role: "ADMIN" },
          totalStudents: students.filter((s) => s.registrationStatus === "ACTIVE").length,
          totalTeachers: teachers.length,
          pendingLeaves: 0,
          pendingReports: 0,
          queuedWhatsApp: 0,
          totalCollected: 0,
          remainingTuition: 0,
          missingDocsCount: 0,
          attendanceRate: 100,
          todayAttendance: [],
          recentReceipts: [],
          recentReports: [],
          recentLeaves: [],
        });
      } catch {
        setData(null);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm font-bold text-slate-500">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-slate-500">لا توجد بيانات محلية. يرجى الاتصال بالإنترنت أولاً.</p>
      </div>
    );
  }

  return (
    <DashboardClient
      school={data.school}
      user={data.session}
      totalStudents={data.totalStudents}
      totalTeachers={data.totalTeachers}
      pendingLeaves={data.pendingLeaves}
      pendingReports={data.pendingReports}
      queuedWhatsApp={data.queuedWhatsApp}
      totalCollected={data.totalCollected}
      remainingTuition={data.remainingTuition}
      missingDocsCount={data.missingDocsCount}
      attendanceRate={data.attendanceRate}
      todayAttendance={data.todayAttendance}
      recentReceipts={data.recentReceipts}
      recentReports={data.recentReports}
      recentLeaves={data.recentLeaves}
    />
  );
}
