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

  await prisma.user.upsert({
    where: {
      email: 'supervisor@test.com',
    },
    update: {
      role: 'SUPERVISOR',
    },
    create: {
      name: 'Supervisor',
      email: 'supervisor@test.com',
      password,
      role: 'SUPERVISOR',
      active: true,
      position: 'Supervisor de turno',
    },
  });

  await prisma.user.upsert({
    where: {
      email: 'empleado@test.com',
    },
    update: {},
    create: {
      name: 'Empleado de prueba',
      email: 'empleado@test.com',
      password,
      role: 'EMPLOYEE',
      active: true,
      position: 'Operador',
    },
  });

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
