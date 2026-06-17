import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftsService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    dto: CreateShiftDto,
  ) {

    return this.prisma.shift.create({
      data: dto,
    });
  }

  async findAll() {

    return this.prisma.shift.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    dto: UpdateShiftDto,
  ) {

    const shift =
      await this.prisma.shift.findUnique({
        where: { id },
      });

    if (!shift) {
      throw new NotFoundException(
        'Turno no encontrado',
      );
    }

    const data: any = {
      name: dto.name,
      startTime: dto.startTime,
      endTime: dto.endTime,
      active: dto.active,
    };

    Object.keys(data).forEach((k) => {
      if (data[k] === undefined) {
        delete data[k];
      }
    });

    return this.prisma.shift.update({
      where: { id },
      data,
    });
  }

  async setActive(
    id: string,
    active: boolean,
  ) {

    const shift =
      await this.prisma.shift.findUnique({
        where: { id },
      });

    if (!shift) {
      throw new NotFoundException(
        'Turno no encontrado',
      );
    }

    return this.prisma.shift.update({
      where: { id },
      data: { active },
    });
  }
}
