import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async upsert(
    dto: CreateAssignmentDto,
  ) {

    const date = new Date(dto.date);

    return this.prisma.assignment.upsert({
      where: {
        userId_date: {
          userId: dto.userId,
          date,
        },
      },
      update: {
        shiftId: dto.shiftId,
        published: false,
        publishedAt: null,
      },
      create: {
        userId: dto.userId,
        shiftId: dto.shiftId,
        date,
      },
      include: {
        user: true,
        shift: true,
      },
    });
  }

  async findAll(
    from?: string,
    to?: string,
  ) {

    const where: any = {};

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    return this.prisma.assignment.findMany({
      where,
      include: {
        user: true,
        shift: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findMine(
    userId: string,
    from?: string,
    to?: string,
  ) {

    const where: any = {
      userId,
      published: true,
    };

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    return this.prisma.assignment.findMany({
      where,
      include: {
        shift: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async remove(
    id: string,
  ) {

    const assignment =
      await this.prisma.assignment.findUnique({
        where: { id },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Asignación no encontrada',
      );
    }

    return this.prisma.assignment.delete({
      where: { id },
    });
  }

  async publishWeek(
    from: string,
    to: string,
  ) {

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const pending =
      await this.prisma.assignment.findMany({
        where: {
          date: {
            gte: fromDate,
            lte: toDate,
          },
          published: false,
        },
        select: {
          userId: true,
        },
      });

    const now = new Date();

    const result =
      await this.prisma.assignment.updateMany({
        where: {
          date: {
            gte: fromDate,
            lte: toDate,
          },
          published: false,
        },
        data: {
          published: true,
          publishedAt: now,
        },
      });

    const uniqueUserIds = [
      ...new Set(
        pending.map((p) => p.userId),
      ),
    ];

    await this.notifications.notifySchedulePublished(
      uniqueUserIds,
      fromDate,
      toDate,
    );

    return {
      publishedCount: result.count,
      notifiedUsers: uniqueUserIds.length,
    };
  }
}
