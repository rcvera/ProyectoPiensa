import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { OvertimesService } from '../overtimes/overtimes.service';
@Injectable()
export class AttendancesService {

  constructor(
    private prisma: PrismaService,
    private overtimesService: OvertimesService,
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

  const updated =
    await this.prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        checkOut: new Date(),
      },
    });

  await this.overtimesService.generateOvertime(
    updated.id,
  );

  return updated;
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