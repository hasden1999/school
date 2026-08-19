"use client";

import React, { useEffect, useState } from "react";
import { fetchAttendanceDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch } from "@/lib/offline/offlineDB";
import { AttendanceClient } from "./AttendanceClient";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [classRooms, setClassRooms] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const isOnline = typeof window !== "undefined" ? navigator.onLine : false;

      if (isOnline) {
        try {
          const res = await fetchAttendanceDataAction();
          if (res.success && res.classRooms && res.sections) {
            setClassRooms(res.classRooms);
            setSections(res.sections);

            // Cache classRooms to 'classrooms' store and sections to 'sections' store
            await Promise.all([
              putRecordsBatch("classrooms", res.classRooms),
              putRecordsBatch("sections", res.sections),
            ]);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Failed to fetch online attendance data, falling back to offline:", err);
        }
      }

      // Offline / fallback: read from IndexedDB
      try {
        const [cachedClassrooms, cachedSections] = await Promise.all([
          getAllRecords<any>("classrooms"),
          getAllRecords<any>("sections"),
        ]);

        setClassRooms(cachedClassrooms || []);
        setSections(cachedSections || []);
      } catch (err) {
        console.error("Failed to load offline attendance data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 font-cairo">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <AttendanceClient
      classRooms={classRooms}
      sections={sections}
      initialStudents={[]}
    />
  );
}
