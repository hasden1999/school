"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getOfflineSession,
  saveOfflineSession,
  getSchoolCache,
  clearOfflineSession,
  OfflineSession,
} from "@/lib/offline/offlineDB";

const SESSION_DURATION_DAYS = 30;

function isSessionValid(session: OfflineSession): boolean {
  if (!session.expiresAt) {
    // Legacy session without expiry — treat as valid but will get renewed
    return true;
  }
  return new Date(session.expiresAt).getTime() > Date.now();
}

function createExpiryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DURATION_DAYS);
  return d.toISOString();
}

/**
 * Client-side auth hook that works both online and offline.
 * Sessions persist for 30 days in IndexedDB — supports multi-day offline use.
 */
export function useOfflineAuth() {
  const [session, setSession] = useState<OfflineSession | null>(null);
  const [schoolName, setSchoolName] = useState<string>("المدرسة");
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadAuth() {
      try {
        const cachedSession = await getOfflineSession();
        if (cachedSession) {
          if (isSessionValid(cachedSession)) {
            setSession(cachedSession);
            setSchoolName(cachedSession.schoolName || "المدرسة");
            setIsAuthenticated(true);
          } else {
            // Session expired — clear it
            await clearOfflineSession();
          }
        }

        const cachedSchool = await getSchoolCache();
        if (cachedSchool) {
          setSchoolName(cachedSchool.schoolName || "المدرسة");
          setTenant({
            id: cachedSchool.tenantId,
            name: cachedSchool.schoolName,
            schoolType: cachedSchool.schoolType,
            currency: cachedSchool.currency,
          });
        }
      } catch (err) {
        console.warn("Failed to read offline auth:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  /**
   * Cache session with 30-day expiry for multi-day offline support
   */
  const cacheSession = useCallback(async (serverSession: any, school?: any) => {
    if (!serverSession) return;

    const offlineSession: OfflineSession = {
      id: serverSession.id,
      tenantId: serverSession.tenantId,
      username: serverSession.username,
      fullName: serverSession.fullName,
      role: serverSession.role,
      phone: serverSession.phone,
      schoolName: school?.name || serverSession.schoolName || "المدرسة",
      savedAt: new Date().toISOString(),
      expiresAt: createExpiryDate(),
    };

    await saveOfflineSession(offlineSession);
    setSession(offlineSession);
    setIsAuthenticated(true);
    setSchoolName(offlineSession.schoolName || "المدرسة");

    if (school) {
      setTenant(school);
    }
  }, []);

  return {
    session,
    schoolName,
    tenant,
    isLoading,
    isAuthenticated,
    cacheSession,
  };
}
