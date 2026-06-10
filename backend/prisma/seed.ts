import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash(
    '123456',
    10,
  );

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@test.com',
      password,
      role: 'ADMIN',
      active: true,
    },
  });

  console.log('Usuario creado');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });