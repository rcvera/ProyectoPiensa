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
  name: true,
  email: true,
  cedula: true,
  role: true,
  phone: true,
  positionId: true,
  position: { select: { id: true, name: true } },
  active: true,
};

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
      const cedulaExists = await this.prisma.user.findUnique({
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
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        cedula: createUserDto.cedula,
        role: createUserDto.role ?? 'EMPLOYEE',
        phone: createUserDto.phone,
        positionId: createUserDto.positionId,
      },
      select: USER_SELECT,
    });

    // Enviar credenciales por correo (no bloqueante)
    this.mail.sendWelcome(user.name, user.email, plainPassword);

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateUserDto) {

    const user = await this.prisma.user.findUnique({ where: { id } });

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

    if (dto.cedula && dto.cedula !== user.cedula) {
      const exists = await this.prisma.user.findUnique({
        where: { cedula: dto.cedula },
      });
      if (exists) {
        throw new ConflictException('Cédula ya registrada');
      }
    }

    const data: any = {
      name: dto.name,
      email: dto.email,
      cedula: dto.cedula,
      role: dto.role,
      phone: dto.phone,
      positionId: dto.positionId ?? null,
      active: dto.active,
    };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    Object.keys(data).forEach((k) => {
      if (data[k] === undefined) {
        delete data[k];
      }
    });

    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  async setActive(id: string, active: boolean) {

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Empleado no encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data: { active },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
  }
}
