"use client";

import { useEffect, useState } from "react";
import { fetchTeachersDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch } from "@/lib/offline/offlineDB";
import { getMemoryData, fastLoad } from "@/lib/dataCache";
import { TeachersClient } from "./TeachersClient";

export default function TeachersPage() {
  const cachedInitial = getMemoryData<any>("admin_teachers_data");
  const [data, setData] = useState<any>(cachedInitial);
  const [loading, setLoading] = useState(!cachedInitial);

  useEffect(() => {
    fastLoad<any>({
      cacheKey: "admin_teachers_data",
      indexedDbLoader: async () => {
        const [cachedTeachers, cachedClassrooms, cachedSections, cachedSubjects] = await Promise.all([
          getAllRecords<any>("teachers"),
          getAllRecords<any>("classrooms"),
          getAllRecords<any>("sections"),
          getAllRecords<any>("subjects"),
        ]);
        if (cachedTeachers && cachedTeachers.length > 0) {
          return {
            teachers: cachedTeachers,
            classRooms: cachedClassrooms || [],
            sections: cachedSections || [],
            subjects: cachedSubjects || [],
            currency: "د.ع",
          };
        }
        return null;
      },
      serverFetcher: fetchTeachersDataAction,
      onCachedData: (cached) => {
        setData(cached);
        setLoading(false);
      },
      onFreshData: (fresh) => {
        setData(fresh);
        setLoading(false);
      },
      onIndexedDbPersist: async (fresh) => {
        if (fresh.teachers) await putRecordsBatch("teachers", fresh.teachers);
        if (fresh.classRooms) await putRecordsBatch("classrooms", fresh.classRooms);
        if (fresh.sections) await putRecordsBatch("sections", fresh.sections);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">جاري تحميل سجل الكادر والموظفين...</p>
        </div>
      </div>
    );
  }

  return (
    <TeachersClient
      teachers={data?.teachers || []}
      classRooms={data?.classRooms || []}
      sections={data?.sections || []}
      subjects={data?.subjects || []}
      currency={data?.currency || "د.ع"}
    />
  );
}
