import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import type {
  Incident,
  User,
} from '@prisma/client';

@Injectable()
export class NotificationsService {

  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async findForUser(
    userId: string,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        incident: {
          select: {
            id: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
  }

  async unreadCount(
    userId: string,
  ) {

    const count =
      await this.prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

    return { count };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ) {

    const notification =
      await this.prisma.notification.findUnique({
        where: {
          id: notificationId,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notificación no encontrada',
      );
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'No autorizado',
      );
    }

    return this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });
  }

  async markAllAsRead(
    userId: string,
  ) {

    await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  }

  async notifyNewIncident(
    incident: Incident & { user: User & { name: string } },
  ): Promise<void> {

    const supervisors =
      await this.prisma.user.findMany({
        where: {
          role: 'SUPERVISOR',
          active: true,
        },
        select: {
          id: true,
        },
      });

    if (supervisors.length === 0) {
      return;
    }

    await this.prisma.notification.createMany({
      data: supervisors.map(
        (supervisor) => ({
          userId: supervisor.id,
          incidentId: incident.id,
          title: 'Nuevo incidente reportado',
          message:
            `${incident.user.name} reportó un incidente: ${incident.type}`,
        }),
      ),
    });
  }

  async notifyIncidentResponse(
    incident: Incident,
  ): Promise<void> {

    await this.prisma.notification.create({
      data: {
        userId: incident.userId,
        incidentId: incident.id,
        title: 'Tu incidente fue actualizado',
        message:
          `Estado actualizado a ${incident.status}`,
      },
    });
  }

  async notifySchedulePublished(
    userIds: string[],
    weekStart: Date,
    weekEnd: Date,
  ): Promise<void> {

    if (userIds.length === 0) return;

    // weekStart/weekEnd vienen de parsear "YYYY-MM-DD" (medianoche UTC);
    // formatearlas en la zona local las correría un día en Ecuador.
    const format = (d: Date) =>
      d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'UTC',
      });

    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: 'Tu horario fue actualizado',
        message:
          `Revisá tu horario del ${format(weekStart)} al ${format(weekEnd)}`,
      })),
    });
  }
}
