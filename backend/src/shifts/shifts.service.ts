import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateShiftDto } from './dto/create-shift.dto';

@Injectable()
export class ShiftsService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    dto: CreateShiftDto,
  ) {

    return (this.prisma as any).shift.create({
      data: dto,
    });
  }

  async findAll() {

    return (this.prisma as any).shift.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}