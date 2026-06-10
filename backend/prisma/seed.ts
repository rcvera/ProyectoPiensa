import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash(
    '123456',
    10,
  );

  await prisma.user.upsert({
    where: {
      email: 'admin@test.com',
    },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@test.com',
      password,
      role: 'ADMIN',
      active: true,
    },
  });

  console.log('Usuario administrador verificado');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });