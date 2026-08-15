import { requireAuth } from "@/lib/auth";
import { getAcademicYearAuditData } from "@/app/actions/academicYearActions";
import { AcademicYearClient } from "./AcademicYearClient";

export default async function AcademicYearPage() {
  await requireAuth(["ADMIN"]);
  const auditData = await getAcademicYearAuditData();

  return <AcademicYearClient auditData={auditData} />;
}
