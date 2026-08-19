"use client";

import React, { useEffect, useState } from "react";
import { fetchGradesDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch, getSchoolCache } from "@/lib/offline/offlineDB";
import { GradesClient } from "./GradesClient";

export default function GradesPage() {
  const [loading, setLoading] = useState(true);
  const [classRooms, setClassRooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [currency, setCurrency] = useState<string>("د.ع");
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const isOnline = typeof window !== "undefined" ? navigator.onLine : false;

      if (isOnline) {
        try {
          const res = await fetchGradesDataAction();
          if (res.success && res.classRooms && res.subjects && res.students) {
            setClassRooms(res.classRooms);
            setSubjects(res.subjects);
            setStudents(res.students);
            setCurrency(res.currency || "د.ع");
            setTenant(res.school || null);

            // Cache to IndexedDB: students to 'students', classRooms to 'classrooms', subjects to 'subjects'
            await Promise.all([
              putRecordsBatch("students", res.students),
              putRecordsBatch("classrooms", res.classRooms),
              putRecordsBatch("subjects", res.subjects),
            ]);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Failed to fetch online grades data, falling back to offline:", err);
        }
      }

      // Offline / fallback: read from IndexedDB
      try {
        const [cachedClassrooms, cachedSubjects, cachedStudents, cachedSchool] =
          await Promise.all([
            getAllRecords<any>("classrooms"),
            getAllRecords<any>("subjects"),
            getAllRecords<any>("students"),
            getSchoolCache(),
          ]);

        setClassRooms(cachedClassrooms || []);
        setSubjects(cachedSubjects || []);
        setStudents(cachedStudents || []);
        setTenant(cachedSchool || null);
        if (cachedSchool?.currency) {
          setCurrency(cachedSchool.currency);
        }
      } catch (err) {
        console.error("Failed to load offline grades data:", err);
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
    <GradesClient
      classRooms={classRooms}
      subjects={subjects}
      students={students}
      currency={currency}
      tenant={tenant}
    />
  );
}
