const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.tenant.updateMany({
    data: {
      name: "مدرسة المعالي الأهلية الابتدائية المختلطة",
    },
  });
  console.log("Updated tenant records count:", updated.count);
  const tenants = await prisma.tenant.findMany();
  console.log("Current tenants:", tenants.map(t => ({ id: t.id, name: t.name, code: t.code })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
