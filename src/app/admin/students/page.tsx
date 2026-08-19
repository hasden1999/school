"use client";

import React, { useEffect, useState } from "react";
import { fetchStudentsDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch, getSchoolCache } from "@/lib/offline/offlineDB";
import { StudentsClient } from "./StudentsClient";

export default function StudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classRooms, setClassRooms] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [currency, setCurrency] = useState<string>("د.ع");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const isOnline = typeof window !== "undefined" ? navigator.onLine : false;

      if (isOnline) {
        try {
          const res = await fetchStudentsDataAction();
          if (res.success && res.students && res.classRooms && res.sections) {
            setStudents(res.students);
            setClassRooms(res.classRooms);
            setSections(res.sections);
            setCurrency(res.currency || "د.ع");

            // Cache results to IndexedDB
            await Promise.all([
              putRecordsBatch("students", res.students),
              putRecordsBatch("classrooms", res.classRooms),
              putRecordsBatch("sections", res.sections),
            ]);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Failed to fetch online students data, falling back to offline:", err);
        }
      }

      // If offline or action fails: read from IndexedDB
      try {
        const [cachedStudents, cachedClassrooms, cachedSections, cachedSchool] =
          await Promise.all([
            getAllRecords<any>("students"),
            getAllRecords<any>("classrooms"),
            getAllRecords<any>("sections"),
            getSchoolCache(),
          ]);

        setStudents(cachedStudents || []);
        setClassRooms(cachedClassrooms || []);
        setSections(cachedSections || []);
        if (cachedSchool?.currency) {
          setCurrency(cachedSchool.currency);
        }
      } catch (err) {
        console.error("Failed to load offline students data:", err);
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
    <StudentsClient
      students={students}
      classRooms={classRooms}
      sections={sections}
      currency={currency}
    />
  );
}
