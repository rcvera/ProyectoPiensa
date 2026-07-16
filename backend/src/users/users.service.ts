import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as bcrypt from 'bcrypt';

function generatePassword(length = 10): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#$%&*';
  const all = upper + lower + digits + symbols;
  const pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  for (let i = pwd.length; i < length; i++) {
    pwd.push(all[Math.floor(Math.random() * all.length)]);
  }
  return pwd.sort(() => Math.random() - 0.5).join('');
}

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  active: true,
  employee: {
    select: {
      name: true,
      cedula: true,
      phone: true,
      positionId: true,
      position: { select: { id: true, name: true } },
      baseSalary: true,
    },
  },
};

// Aplana { ...user, employee: { name, cedula, ... } } a la forma plana
// que espera el frontend: { ...user, name, cedula, ... }
// El sueldo es dato sensible: solo se incluye si quien pregunta es ADMIN
// (ej. un SUPERVISOR listando empleados para asignar turnos no lo ve).
function flattenUser(user: any, requesterRole: string = 'ADMIN') {
  const { employee, ...rest } = user;
  return {
    ...rest,
    name: employee?.name ?? null,
    cedula: employee?.cedula ?? null,
    phone: employee?.phone ?? null,
    positionId: employee?.positionId ?? null,
    position: employee?.position ?? null,
    ...(requesterRole === 'ADMIN'
      ? { baseSalary: employee?.baseSalary ?? null }
      : {}),
  };
}

@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {

    const userExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new ConflictException('Correo ya registrado');
    }

    if (createUserDto.cedula) {
      const cedulaExists = await this.prisma.employee.findUnique({
        where: { cedula: createUserDto.cedula },
      });
      if (cedulaExists) {
        throw new ConflictException('Cédula ya registrada');
      }
    }

    const plainPassword = createUserDto.password || generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role ?? 'EMPLOYEE',
        employee: {
          create: {
            name: createUserDto.name,
            cedula: createUserDto.cedula,
            phone: createUserDto.phone,
            positionId: createUserDto.positionId,
            baseSalary: createUserDto.baseSalary,
          },
        },
      },
      select: USER_SELECT,
    });

    // Enviar credenciales por correo (no bloqueante)
    this.mail.sendWelcome(createUserDto.name, user.email, plainPassword);

    return flattenUser(user);
  }

  async findAll(requesterRole: string) {
    const users = await this.prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => flattenUser(u, requesterRole));
  }

  async update(id: string, dto: UpdateUserDto) {

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!user) {
      throw new NotFoundException('Empleado no encontrado');
    }

    if (dto.email && dto.email !== user.email) {
      const exists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (exists) {
        throw new ConflictException('Correo ya registrado');
      }
    }

    if (dto.cedula && dto.cedula !== user.employee?.cedula) {
      const exists = await this.prisma.employee.findUnique({
        where: { cedula: dto.cedula },
      });
      if (exists) {
        throw new ConflictException('Cédula ya registrada');
      }
    }

    const userData: any = {
      email: dto.email,
      role: dto.role,
      active: dto.active,
    };

    if (dto.password) {
      userData.password = await bcrypt.hash(dto.password, 10);
    }

    const employeeData: any = {
      name: dto.name,
      cedula: dto.cedula,
      phone: dto.phone,
      positionId: dto.positionId ?? null,
      baseSalary: dto.baseSalary,
    };

    [userData, employeeData].forEach((data) => {
      Object.keys(data).forEach((k) => {
        if (data[k] === undefined) {
          delete data[k];
        }
      });
    });

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(Object.keys(employeeData).length > 0
          ? { employee: { update: employeeData } }
          : {}),
      },
      select: USER_SELECT,
    });

    return flattenUser(updated);
  }

  async resetPassword(id: string) {

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!user) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    this.mail.sendPasswordReset(
      user.employee?.name ?? user.email,
      user.email,
      plainPassword,
    );

    return { message: 'Contraseña restablecida y enviada por correo' };
  }

  async setActive(id: string, active: boolean) {

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Empleado no encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data: { active },
      select: { id: true, email: true, role: true, active: true },
    });
  }
}
