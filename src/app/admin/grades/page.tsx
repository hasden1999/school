"use client";

import React, { useEffect, useState } from "react";
import { fetchGradesDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch, getSchoolCache } from "@/lib/offline/offlineDB";
import { getMemoryData, fastLoad } from "@/lib/dataCache";
import { GradesClient } from "./GradesClient";

export default function GradesPage() {
  const cachedInitial = getMemoryData<any>("admin_grades_data");
  const [data, setData] = useState<any>(cachedInitial);
  const [loading, setLoading] = useState(!cachedInitial);

  useEffect(() => {
    fastLoad<any>({
      cacheKey: "admin_grades_data",
      indexedDbLoader: async () => {
        const [cachedClassrooms, cachedSubjects, cachedStudents, cachedSchool] =
          await Promise.all([
            getAllRecords<any>("classrooms"),
            getAllRecords<any>("subjects"),
            getAllRecords<any>("students"),
            getSchoolCache(),
          ]);

        if (cachedStudents && cachedStudents.length > 0) {
          return {
            classRooms: cachedClassrooms || [],
            subjects: cachedSubjects || [],
            students: cachedStudents,
            tenant: cachedSchool || null,
            currency: cachedSchool?.currency || "د.ع",
          };
        }
        return null;
      },
      serverFetcher: fetchGradesDataAction,
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
        if (fresh.subjects) await putRecordsBatch("subjects", fresh.subjects);
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
        <p className="text-sm font-bold text-slate-500">جاري تحميل سجل الدرجات والشهادات...</p>
      </div>
    );
  }

  return (
    <GradesClient
      classRooms={data?.classRooms || []}
      subjects={data?.subjects || []}
      students={data?.students || []}
      currency={data?.currency || "د.ع"}
      tenant={data?.tenant || data?.school || null}
    />
  );
}
