import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getStats() {

    const employees =
      await this.prisma.user.count();

    const shifts =
      await this.prisma.shift.count();

    const attendancesToday =
      await this.prisma.attendance.count({
        where: {
          checkIn: {
            gte: new Date(
              new Date().setHours(
                0,
                0,
                0,
                0,
              ),
            ),
          },
        },
      });

    const overtime =
      await this.prisma.overtime.aggregate({
        _sum: {
          overtimeHours: true,
        },
      });

    return {
      employees,
      shifts,
      attendancesToday,
      overtimeHours:
        overtime._sum
          .overtimeHours ?? 0,
    };
  }
}