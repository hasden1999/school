"use client";

import { useEffect, useState } from "react";
import { fetchPaymentsDataAction } from "@/app/actions/dataFetchActions";
import { getAllRecords, putRecordsBatch } from "@/lib/offline/offlineDB";
import { PaymentsClient } from "./PaymentsClient";

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classRooms, setClassRooms] = useState<any[]>([]);
  const [currency, setCurrency] = useState("د.ع");
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (typeof window !== "undefined" && navigator.onLine) {
          const res = await fetchPaymentsDataAction();
          if (res.success && res.students && res.classRooms) {
            setStudents(res.students);
            setClassRooms(res.classRooms);
            setCurrency(res.currency || "د.ع");
            setTenant(res.school || null);

            // Cache to IndexedDB
            await Promise.all([
              putRecordsBatch("students", res.students),
              putRecordsBatch("classrooms", res.classRooms),
            ]);
            setLoading(false);
            return;
          }
        }

        // Offline fallback
        const [cachedStudents, cachedClassrooms] = await Promise.all([
          getAllRecords<any>("students"),
          getAllRecords<any>("classrooms"),
        ]);
        setStudents(cachedStudents || []);
        setClassRooms(cachedClassrooms || []);
      } catch (err) {
        console.error("Error loading payments data:", err);
        const [cachedStudents, cachedClassrooms] = await Promise.all([
          getAllRecords<any>("students"),
          getAllRecords<any>("classrooms"),
        ]);
        setStudents(cachedStudents || []);
        setClassRooms(cachedClassrooms || []);
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
    <PaymentsClient
      students={students}
      classRooms={classRooms}
      currency={currency}
      tenant={tenant}
    />
  );
}
