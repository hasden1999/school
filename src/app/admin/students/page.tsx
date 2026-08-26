"use client";

import React, { useEffect, useState } from "react";
import { fetchStudentsDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch, getSchoolCache } from "@/lib/offline/offlineDB";
import { getMemoryData, fastLoad } from "@/lib/dataCache";
import { StudentsClient } from "./StudentsClient";

export default function StudentsPage() {
  const cachedInitial = getMemoryData<any>("admin_students_data");
  const [data, setData] = useState<any>(cachedInitial);
  const [loading, setLoading] = useState(!cachedInitial);

  useEffect(() => {
    fastLoad<any>({
      cacheKey: "admin_students_data",
      indexedDbLoader: async () => {
        const [cachedStudents, cachedClassrooms, cachedSections, cachedSchool] =
          await Promise.all([
            getAllRecords<any>("students"),
            getAllRecords<any>("classrooms"),
            getAllRecords<any>("sections"),
            getSchoolCache(),
          ]);
        if (cachedStudents && cachedStudents.length > 0) {
          return {
            students: cachedStudents,
            classRooms: cachedClassrooms || [],
            sections: cachedSections || [],
            currency: cachedSchool?.currency || "د.ع",
          };
        }
        return null;
      },
      serverFetcher: fetchStudentsDataAction,
      onCachedData: (cached) => {
        setData(cached);
        setLoading(false);
      },
      onFreshData: (fresh) => {
        setData(fresh);
        setLoading(false);
      },
      onIndexedDbPersist: async (fresh) => {
        if (fresh.students) await putRecordsBatch("students", fresh.students);
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
        <p className="text-sm font-bold text-slate-500">جاري تحميل سجل الطلاب...</p>
      </div>
    );
  }

  return (
    <StudentsClient
      students={data?.students || []}
      classRooms={data?.classRooms || []}
      sections={data?.sections || []}
      currency={data?.currency || "د.ع"}
    />
  );
}
