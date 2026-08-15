import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendancePage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const [classRooms, sections] = await Promise.all([
    prisma.classRoom.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.section.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    }),
  ]);

  return <AttendanceClient classRooms={classRooms} sections={sections} initialStudents={[]} />;
}
