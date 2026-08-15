import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScheduleClient } from "./ScheduleClient";
import { getTeacherLeaveImpactData } from "@/app/actions/scheduleActions";

export default async function AdminSchedulePage() {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const [classRooms, teachers, subjects, allSlots, teacherLeaves, impacts, school] =
    await Promise.all([
      prisma.classRoom.findMany({
        where: { tenantId },
        include: { sections: true },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.user.findMany({
        where: { tenantId, role: "TEACHER", active: true },
        orderBy: { fullName: "asc" },
      }),
      prisma.subject.findMany({
        where: { tenantId },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.timetableSlot.findMany({
        where: { tenantId },
        include: {
          teacher: true,
          subject: true,
          classRoom: true,
          section: true,
        },
      }),
      prisma.teacherLeave.findMany({
        where: { tenantId, status: "APPROVED" },
        include: { teacher: true },
        orderBy: { createdAt: "desc" },
      }),
      getTeacherLeaveImpactData(),
      prisma.tenant.findUnique({ where: { id: tenantId } }),
    ]);

  return (
    <ScheduleClient
      classRooms={classRooms}
      teachers={teachers}
      subjects={subjects}
      allSlots={allSlots}
      teacherLeaves={teacherLeaves}
      impacts={impacts}
      tenant={school}
    />
  );
}
