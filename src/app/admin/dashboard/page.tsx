"use client";

import React, { useState, useEffect } from "react";
import { DashboardClient } from "./DashboardClient";
import { fetchDashboardDataAction } from "@/app/actions/dataFetchActions";
import { getSchoolCache, getAllRecords } from "@/lib/offline/offlineDB";
import { getMemoryData, fastLoad } from "@/lib/dataCache";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const cachedInitial = getMemoryData<any>("admin_dashboard_data");
  const [data, setData] = useState<any>(cachedInitial);
  const [loading, setLoading] = useState(!cachedInitial);

  useEffect(() => {
    fastLoad<any>({
      cacheKey: "admin_dashboard_data",
      indexedDbLoader: async () => {
        const [cached, students, teachers] = await Promise.all([
          getSchoolCache(),
          getAllRecords<any>("students"),
          getAllRecords<any>("teachers"),
        ]);
        if (students && students.length > 0) {
          return {
            success: true,
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
          };
        }
        return null;
      },
      serverFetcher: fetchDashboardDataAction,
      onCachedData: (cached) => {
        setData(cached);
        setLoading(false);
      },
      onFreshData: (fresh) => {
        setData(fresh);
        setLoading(false);
      },
    }).then((res) => {
      if (res) {
        setData(res);
        setLoading(false);
      }
    });
  }, []);

  if (loading && !data) {
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
