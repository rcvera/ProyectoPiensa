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

  async checkIn(userId: string) {

    const openAttendance = await this.prisma.attendance.findFirst({
      where: { userId, checkOut: null },
    });

    if (openAttendance) {
      throw new BadRequestException('Ya existe una entrada activa');
    }

    // Verificar turno asignado para hoy
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const assignment = await this.prisma.assignment.findFirst({
      where: {
        userId,
        date: { gte: todayStart, lte: todayEnd },
      },
      include: { shift: true },
    });

    if (assignment?.shift?.startTime) {
      const [shiftHour, shiftMin] = assignment.shift.startTime.split(':').map(Number);
      const shiftMinutes = shiftHour * 60 + shiftMin;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      if (nowMinutes < shiftMinutes) {
        throw new BadRequestException(
          `Tu turno comienza a las ${assignment.shift.startTime}. No puedes marcar entrada antes de esa hora.`,
        );
      }
    }

    return this.prisma.attendance.create({
      data: { userId, checkIn: new Date() },
    });
  }

  async breakStart(
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
        'No hay entrada activa para iniciar el almuerzo',
      );
    }

    if (attendance.breakStart) {
      throw new BadRequestException(
        'Ya marcaste salida al almuerzo',
      );
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        breakStart: new Date(),
      },
    });
  }

  async breakEnd(
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
        'No hay entrada activa',
      );
    }

    if (!attendance.breakStart) {
      throw new BadRequestException(
        'No iniciaste el almuerzo',
      );
    }

    if (attendance.breakEnd) {
      throw new BadRequestException(
        'Ya marcaste vuelta del almuerzo',
      );
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        breakEnd: new Date(),
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
        'No existe entrada registrada',
      );
    }

    if (
      attendance.breakStart &&
      !attendance.breakEnd
    ) {
      throw new BadRequestException(
        'Tenés que marcar la vuelta del almuerzo antes de salir',
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

  async findAll(
    userId?: string,
    from?: string,
    to?: string,
  ) {

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (from || to) {
      where.checkIn = {};
      if (from) where.checkIn.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.checkIn.lte = toDate;
      }
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: {
        checkIn: 'desc',
      },
    });
  }

  async findOpenForUser(
    userId: string,
  ) {
    return this.prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null,
      },
    });
  }
}
