import { prisma } from "../src/lib/prisma";
import { getPresetForSchoolType } from "../src/lib/curriculumPresets";

async function main() {
  const tenants = await prisma.tenant.findMany();
  console.log(`Found ${tenants.length} tenants in database`);

  for (const t of tenants) {
    const preset = getPresetForSchoolType(t.schoolType);
    console.log(`Syncing Tenant: ${t.name} (${t.schoolType}) -> ${preset.stageTitle}`);

    const existingClasses = await prisma.classRoom.findMany({
      where: { tenantId: t.id },
      include: {
        _count: { select: { studentProfiles: true } },
        sections: true,
      },
    });

    const presetCodes = new Set(preset.classRooms.map((c) => c.code));
    const presetNames = new Set(preset.classRooms.map((c) => c.name));

    for (const c of existingClasses) {
      const isPartOfNewPreset = presetCodes.has(c.code) || presetNames.has(c.name);
      if (!isPartOfNewPreset && c._count.studentProfiles === 0) {
        try {
          await prisma.classRoom.delete({ where: { id: c.id } });
          console.log(`Deleted empty unused class: ${c.name}`);
        } catch (e) {
          // ignore
        }
      }
    }

    for (const pClass of preset.classRooms) {
      const existing = existingClasses.find(
        (c) => c.code === pClass.code || c.name === pClass.name
      );

      if (existing) {
        await prisma.classRoom.update({
          where: { id: existing.id },
          data: {
            name: pClass.name,
            code: pClass.code,
            orderIndex: pClass.orderIndex,
            isGraduatingClass: !!pClass.isGraduatingClass,
          },
        });
      } else {
        await prisma.classRoom.create({
          data: {
            tenantId: t.id,
            name: pClass.name,
            code: pClass.code,
            annualTuition: pClass.tuition,
            orderIndex: pClass.orderIndex,
            isGraduatingClass: !!pClass.isGraduatingClass,
            sections: {
              create: {
                tenantId: t.id,
                name: "أ",
              },
            },
          },
        });
        console.log(`Created stage class: ${pClass.name}`);
      }
    }

    // Subjects
    const existingSubjects = await prisma.subject.findMany({
      where: { tenantId: t.id },
    });

    for (const pSub of preset.subjects) {
      const existing = existingSubjects.find(
        (s) => s.code === pSub.code || s.name === pSub.name
      );

      if (existing) {
        await prisma.subject.update({
          where: { id: existing.id },
          data: {
            name: pSub.name,
            code: pSub.code,
            orderIndex: pSub.orderIndex,
          },
        });
      } else {
        await prisma.subject.create({
          data: {
            tenantId: t.id,
            name: pSub.name,
            code: pSub.code,
            orderIndex: pSub.orderIndex,
          },
        });
        console.log(`Created stage subject: ${pSub.name}`);
      }
    }
  }

  console.log("All tenants synchronized successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
