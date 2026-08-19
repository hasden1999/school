"use client";

import { useEffect, useState } from "react";
import { fetchTeachersDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch } from "@/lib/offline/offlineDB";
import { TeachersClient } from "./TeachersClient";

export default function TeachersPage() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classRooms, setClassRooms] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [currency, setCurrency] = useState("د.ع");

  useEffect(() => {
    async function loadData() {
      try {
        if (typeof window !== "undefined" && navigator.onLine) {
          const res = await fetchTeachersDataAction();
          if (res.success && res.teachers) {
            setTeachers(res.teachers);
            setClassRooms(res.classRooms || []);
            setSections(res.sections || []);
            setSubjects(res.subjects || []);
            setCurrency(res.currency || "د.ع");

            // Cache to IndexedDB
            await Promise.all([
              putRecordsBatch("teachers", res.teachers),
              putRecordsBatch("classrooms", res.classRooms || []),
              putRecordsBatch("sections", res.sections || []),
              putRecordsBatch("subjects", res.subjects || []),
            ]);
            setLoading(false);
            return;
          }
        }

        // Offline fallback
        const [cachedTeachers, cachedClassrooms, cachedSections, cachedSubjects] = await Promise.all([
          getAllRecords<any>("teachers"),
          getAllRecords<any>("classrooms"),
          getAllRecords<any>("sections"),
          getAllRecords<any>("subjects"),
        ]);
        setTeachers(cachedTeachers || []);
        setClassRooms(cachedClassrooms || []);
        setSections(cachedSections || []);
        setSubjects(cachedSubjects || []);
      } catch (err) {
        console.error("Error loading teachers data:", err);
        const [cachedTeachers, cachedClassrooms, cachedSections, cachedSubjects] = await Promise.all([
          getAllRecords<any>("teachers"),
          getAllRecords<any>("classrooms"),
          getAllRecords<any>("sections"),
          getAllRecords<any>("subjects"),
        ]);
        setTeachers(cachedTeachers || []);
        setClassRooms(cachedClassrooms || []);
        setSections(cachedSections || []);
        setSubjects(cachedSubjects || []);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <TeachersClient
      teachers={teachers}
      classRooms={classRooms}
      sections={sections}
      subjects={subjects}
      currency={currency}
    />
  );
}
