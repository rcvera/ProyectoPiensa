import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ) {

    const userExists =
      await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });

    if (userExists) {
      throw new ConflictException(
        'Correo ya registrado',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        createUserDto.password,
        10,
      );

    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role ?? 'EMPLOYEE',
        phone: createUserDto.phone,
        position: createUserDto.position,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        position: true,
        active: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ) {

    const user =
      await this.prisma.user.findUnique({
        where: { id },
      });

    if (!user) {
      throw new NotFoundException(
        'Empleado no encontrado',
      );
    }

    if (
      dto.email &&
      dto.email !== user.email
    ) {
      const exists =
        await this.prisma.user.findUnique({
          where: { email: dto.email },
        });
      if (exists) {
        throw new ConflictException(
          'Correo ya registrado',
        );
      }
    }

    const data: any = {
      name: dto.name,
      email: dto.email,
      role: dto.role,
      phone: dto.phone,
      position: dto.position,
      active: dto.active,
    };

    if (dto.password) {
      data.password = await bcrypt.hash(
        dto.password,
        10,
      );
    }

    Object.keys(data).forEach((k) => {
      if (data[k] === undefined) {
        delete data[k];
      }
    });

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        position: true,
        active: true,
      },
    });
  }

  async setActive(
    id: string,
    active: boolean,
  ) {

    const user =
      await this.prisma.user.findUnique({
        where: { id },
      });

    if (!user) {
      throw new NotFoundException(
        'Empleado no encontrado',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: { active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });
  }
}
