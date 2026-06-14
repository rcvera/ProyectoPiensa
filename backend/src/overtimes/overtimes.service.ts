import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OvertimesService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async generateOvertime(
    attendanceId: string,
  ) {

    const attendance =
      await this.prisma.attendance.findUnique({
        where: {
          id: attendanceId,
        },
      });

    if (
      !attendance ||
      !attendance.checkOut
    ) {
      return;
    }

    const workedHours =
      (
        attendance.checkOut.getTime()
        -
        attendance.checkIn.getTime()
      )
      /
      1000
      /
      60
      /
      60;

    const overtimeHours =
      Math.max(
        workedHours - 8,
        0,
      );

    return this.prisma.overtime.create({
      data: {
        userId:
          attendance.userId,

        attendanceId:
          attendance.id,

        workedHours,

        overtimeHours,

        date:
          attendance.checkIn,
      },
    });
  }

  async findAll() {

    return this.prisma.overtime.findMany({
      include: {
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}