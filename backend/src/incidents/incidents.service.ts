import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import { CreateIncidentDto } from './dto/create-incident.dto';
import { RespondIncidentDto } from './dto/respond-incident.dto';
import { FilterIncidentsDto } from './dto/filter-incidents.dto';

@Injectable()
export class IncidentsService {

  constructor(
    private readonly prisma:
      PrismaService,
    private readonly notificationsService:
      NotificationsService,
  ) {}

  async create(
    userId: string,
    dto: CreateIncidentDto,
    photoUrl: string | null,
  ) {

    const incident =
      await this.prisma.incident.create({
        data: {
          userId,
          type: dto.type,
          description: dto.description,
          photoUrl: photoUrl ?? undefined,
        },
        include: {
          user: true,
        },
      });

    await this.notificationsService.notifyNewIncident(
      incident,
    );

    return incident;
  }

  async findAll(
    filters: FilterIncidentsDto,
  ) {

    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from || filters.to) {
      where.createdAt = {};

      if (filters.from) {
        where.createdAt.gte =
          new Date(filters.from);
      }

      if (filters.to) {
        where.createdAt.lte =
          new Date(filters.to);
      }
    }

    return this.prisma.incident.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMine(
    userId: string,
  ) {
    return this.prisma.incident.findMany({
      where: {
        userId,
      },
      include: {
        reviewedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    id: string,
    callerId: string,
    callerRole: string,
  ) {

    const incident =
      await this.prisma.incident.findUnique({
        where: {
          id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!incident) {
      throw new NotFoundException(
        'Incidente no encontrado',
      );
    }

    const isPrivileged =
      callerRole === 'ADMIN'
      || callerRole === 'SUPERVISOR';

    if (
      !isPrivileged
      && incident.userId !== callerId
    ) {
      throw new ForbiddenException(
        'No autorizado',
      );
    }

    return incident;
  }

  async respond(
    id: string,
    reviewerId: string,
    dto: RespondIncidentDto,
  ) {

    const existing =
      await this.prisma.incident.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Incidente no encontrado',
      );
    }

    const updated =
      await this.prisma.incident.update({
        where: {
          id,
        },
        data: {
          status: dto.status,
          adminResponse: dto.adminResponse,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

    await this.notificationsService.notifyIncidentResponse(
      updated,
    );

    return updated;
  }
}
