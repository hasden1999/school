"use client";

import React, { useEffect, useState } from "react";
import { fetchAttendanceDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch } from "@/lib/offline/offlineDB";
import { getMemoryData, fastLoad } from "@/lib/dataCache";
import { AttendanceClient } from "./AttendanceClient";

export default function AttendancePage() {
  const cachedInitial = getMemoryData<any>("admin_attendance_init");
  const [data, setData] = useState<any>(cachedInitial);
  const [loading, setLoading] = useState(!cachedInitial);

  useEffect(() => {
    fastLoad<any>({
      cacheKey: "admin_attendance_init",
      indexedDbLoader: async () => {
        const [cachedClassrooms, cachedSections] = await Promise.all([
          getAllRecords<any>("classrooms"),
          getAllRecords<any>("sections"),
        ]);
        if (cachedClassrooms && cachedClassrooms.length > 0) {
          return {
            classRooms: cachedClassrooms,
            sections: cachedSections || [],
          };
        }
        return null;
      },
      serverFetcher: fetchAttendanceDataAction,
      onCachedData: (cached) => {
        setData(cached);
        setLoading(false);
      },
      onFreshData: (fresh) => {
        setData(fresh);
        setLoading(false);
      },
      onIndexedDbPersist: async (fresh) => {
        if (fresh.classRooms) await putRecordsBatch("classrooms", fresh.classRooms);
        if (fresh.sections) await putRecordsBatch("sections", fresh.sections);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 font-cairo">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500">جاري تحميل سجل الحضور...</p>
      </div>
    );
  }

  return (
    <AttendanceClient
      classRooms={data?.classRooms || []}
      sections={data?.sections || []}
      initialStudents={[]}
    />
  );
}
