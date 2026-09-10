const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function testLogin(username, password) {
  const user = await prisma.user.findFirst({
    where: { username, active: true },
    include: { tenant: true }
  });
  if (!user) return { ok: false, error: 'User not found' };
  const hashOk = await bcrypt.compare(password, user.passwordHash);
  const plainOk = user.plainPasscode && user.plainPasscode.trim().toLowerCase() === password.toLowerCase();
  return { ok: hashOk || plainOk, role: user.role, tenant: user.tenant?.name };
}
async function run() {
  console.log('Testing "super":', await testLogin('superadmin', 'super'));
  console.log('Testing "super123":', await testLogin('superadmin', 'super123'));
}
run().finally(() => prisma.$disconnect());
