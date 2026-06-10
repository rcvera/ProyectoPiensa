import {
  Injectable,
  ConflictException
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService
  ) {}

  async create(
    createUserDto: CreateUserDto
  ) {

    const userExists =
      await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });

    if (userExists) {
      throw new ConflictException(
        'Correo ya registrado'
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
}