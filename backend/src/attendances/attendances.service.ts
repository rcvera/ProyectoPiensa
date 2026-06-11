import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendancesService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async checkIn(
    userId: string,
  ) {

    const openAttendance =
      await this.prisma.attendance.findFirst({
        where: {
          userId,
          checkOut: null,
        },
      });

    if (openAttendance) {
      throw new BadRequestException(
        'Ya existe una entrada activa'
      );
    }

    return this.prisma.attendance.create({
      data: {
        userId,
        checkIn: new Date(),
      },
    });
  }

  async checkOut(
    userId: string,
  ) {

    const attendance =
      await this.prisma.attendance.findFirst({
        where: {
          userId,
          checkOut: null,
        },
      });

    if (!attendance) {
      throw new BadRequestException(
        'No existe entrada registrada'
      );
    }

    return this.prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        checkOut: new Date(),
      },
    });
  }

  async history() {

    return this.prisma.attendance.findMany({
      include: {
        user: true,
      },
      orderBy: {
        checkIn: 'desc',
      },
    });
  }
}