import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertUser(
  email: string,
  name: string,
  role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE',
  password: string,
) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role },
    });
    await prisma.employee.upsert({
      where: { userId: existing.id },
      update: {},
      create: { userId: existing.id, name },
    });
    return;
  }

  await prisma.user.create({
    data: {
      email,
      password,
      role,
      active: true,
      employee: { create: { name } },
    },
  });
}

async function main() {
  const password = await bcrypt.hash(
    '123456',
    10,
  );

  await upsertUser('admin@test.com', 'Administrador', 'ADMIN', password);
  await upsertUser('supervisor@test.com', 'Supervisor', 'SUPERVISOR', password);
  await upsertUser('empleado@test.com', 'Empleado de prueba', 'EMPLOYEE', password);

  console.log('Usuarios verificados:');
  console.log('  admin@test.com      / 123456  (ADMIN)');
  console.log('  supervisor@test.com / 123456  (SUPERVISOR)');
  console.log('  empleado@test.com   / 123456  (EMPLOYEE)');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
