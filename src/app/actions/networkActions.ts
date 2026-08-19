"use server";

import { getLocalNetworkInfo, LocalNetworkInfo } from "@/lib/server/localNetwork";
import { getSession } from "@/lib/auth";

export async function getSchoolNetworkAccessAction(): Promise<{
  success: boolean;
  network?: LocalNetworkInfo;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "غير مصرح لك" };
    }

    const network = await getLocalNetworkInfo(3000);
    return {
      success: true,
      network,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message || "فشل جلب بيانات الشبكة المحلية",
    };
  }
}
