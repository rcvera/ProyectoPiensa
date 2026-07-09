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
        user: { select: { id: true, email: true, role: true, active: true } },
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
        user: { select: { id: true, email: true, role: true, active: true } },
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

  async fillWeek(
    shiftId: string,
    from: string,
    to: string,
    userIds?: string[],
    isoDays?: number[],
  ) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const targetUsers =
      userIds && userIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: userIds }, active: true },
            select: { id: true },
          })
        : await this.prisma.user.findMany({
            where: { active: true },
            select: { id: true },
          });

    const allDays: Date[] = [];
    const cursor = new Date(fromDate);
    while (cursor <= toDate) {
      allDays.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    // Filter by ISO day of week (1=Mon … 7=Sun) if provided
    const days =
      isoDays && isoDays.length > 0
        ? allDays.filter((d) => {
            const iso = d.getDay() === 0 ? 7 : d.getDay();
            return isoDays.includes(iso);
          })
        : allDays;

    const existing = await this.prisma.assignment.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
      select: { userId: true, date: true },
    });

    const existingSet = new Set(
      existing.map((a) => `${a.userId}_${a.date.toISOString().slice(0, 10)}`),
    );

    const toCreate: { userId: string; shiftId: string; date: Date }[] = [];

    for (const user of targetUsers) {
      for (const day of days) {
        const key = `${user.id}_${day.toISOString().slice(0, 10)}`;
        if (!existingSet.has(key)) {
          toCreate.push({ userId: user.id, shiftId, date: day });
        }
      }
    }

    if (toCreate.length > 0) {
      await this.prisma.assignment.createMany({ data: toCreate });
    }

    return { created: toCreate.length, skipped: existing.length };
  }

  async clearWeek(from: string, to: string, userIds?: string[]) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const where: any = {
      date: { gte: fromDate, lte: toDate },
    };

    if (userIds && userIds.length > 0) {
      where.userId = { in: userIds };
    }

    const result = await this.prisma.assignment.deleteMany({ where });

    return { deleted: result.count };
  }

  async copyWeek(from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const prevFrom = new Date(fromDate);
    prevFrom.setDate(prevFrom.getDate() - 7);
    const prevTo = new Date(toDate);
    prevTo.setDate(prevTo.getDate() - 7);

    const prevAssignments = await this.prisma.assignment.findMany({
      where: { date: { gte: prevFrom, lte: prevTo } },
      select: { userId: true, shiftId: true, date: true },
    });

    const existing = await this.prisma.assignment.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
      select: { userId: true, date: true },
    });

    const existingSet = new Set(
      existing.map((a) => `${a.userId}_${a.date.toISOString().slice(0, 10)}`),
    );

    const toCreate: { userId: string; shiftId: string; date: Date }[] = [];

    for (const prev of prevAssignments) {
      const newDate = new Date(prev.date);
      newDate.setDate(newDate.getDate() + 7);
      const key = `${prev.userId}_${newDate.toISOString().slice(0, 10)}`;
      if (!existingSet.has(key)) {
        toCreate.push({ userId: prev.userId, shiftId: prev.shiftId, date: newDate });
      }
    }

    if (toCreate.length > 0) {
      await this.prisma.assignment.createMany({ data: toCreate });
    }

    return { created: toCreate.length, skipped: existing.length };
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
