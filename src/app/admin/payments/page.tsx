"use client";

import { useEffect, useState } from "react";
import { fetchPaymentsDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch, getSchoolCache } from "@/lib/offline/offlineDB";
import { getMemoryData, fastLoad } from "@/lib/dataCache";
import { PaymentsClient } from "./PaymentsClient";

export default function PaymentsPage() {
  const cachedInitial = getMemoryData<any>("admin_payments_data");
  const [data, setData] = useState<any>(cachedInitial);
  const [loading, setLoading] = useState(!cachedInitial);

  useEffect(() => {
    fastLoad<any>({
      cacheKey: "admin_payments_data",
      indexedDbLoader: async () => {
        const [cachedStudents, cachedClassrooms, cachedSchool] = await Promise.all([
          getAllRecords<any>("students"),
          getAllRecords<any>("classrooms"),
          getSchoolCache(),
        ]);
        if (cachedStudents && cachedStudents.length > 0) {
          return {
            students: cachedStudents,
            classRooms: cachedClassrooms || [],
            currency: cachedSchool?.currency || "د.ع",
            school: cachedSchool || null,
          };
        }
        return null;
      },
      serverFetcher: fetchPaymentsDataAction,
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
          <p className="text-sm font-bold text-slate-500">جاري تحميل سندات القبض والأقساط...</p>
        </div>
      </div>
    );
  }

  return (
    <PaymentsClient
      students={data?.students || []}
      classRooms={data?.classRooms || []}
      currency={data?.currency || "د.ع"}
      tenant={data?.school || data?.tenant || null}
    />
  );
}
