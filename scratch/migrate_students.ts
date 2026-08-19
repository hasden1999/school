import { prisma } from "../src/lib/prisma";

async function main() {
  const primarySchools = await prisma.tenant.findMany({
    where: { schoolType: { contains: "ابتدائ" } },
    include: {
      classRooms: {
        include: {
          sections: true,
          studentProfiles: true,
        },
      },
    },
  });

  for (const school of primarySchools) {
    console.log(`School: ${school.name}`);
    const firstPrimary = school.classRooms.find((c) => c.code === "1-PRI" || c.name.includes("الأول الابتدائي"));
    if (!firstPrimary || firstPrimary.sections.length === 0) continue;

    const firstSection = firstPrimary.sections[0];

    // Check if any students are in non-primary classes
    const nonPrimaryClasses = school.classRooms.filter((c) => !c.code.endsWith("-PRI") && !c.name.includes("الابتدائي"));

    for (const oldClass of nonPrimaryClasses) {
      if (oldClass.studentProfiles.length > 0) {
        console.log(`Migrating ${oldClass.studentProfiles.length} students from ${oldClass.name} to ${firstPrimary.name}`);
        for (const stu of oldClass.studentProfiles) {
          await prisma.studentProfile.update({
            where: { id: stu.id },
            data: {
              classRoomId: firstPrimary.id,
              sectionId: firstSection.id,
            },
          });
        }
      }

      // Now safe to delete old non-primary class
      try {
        await prisma.classRoom.delete({ where: { id: oldClass.id } });
        console.log(`Cleaned up old class: ${oldClass.name}`);
      } catch (err) {
        console.log(`Could not delete class ${oldClass.name}:`, err);
      }
    }
  }

  console.log("Migration complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
