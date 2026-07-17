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

const USER_REF_SELECT = {
  id: true,
  email: true,
  employee: { select: { name: true } },
};

const REVIEWER_REF_SELECT = {
  id: true,
  employee: { select: { name: true } },
};

function flattenUserRef(user: any) {
  if (!user) return user;
  const { employee, ...rest } = user;
  return { ...rest, name: employee?.name ?? user.email };
}

function flattenReviewerRef(reviewer: any) {
  if (!reviewer) return reviewer;
  const { employee, ...rest } = reviewer;
  return { ...rest, name: employee?.name ?? null };
}

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
          user: { select: USER_REF_SELECT },
        },
      });

    await this.notificationsService.notifyNewIncident({
      ...incident,
      user: flattenUserRef(incident.user) as any,
    });

    return {
      ...incident,
      user: flattenUserRef(incident.user),
    };
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

      // "YYYY-MM-DD" no debe parsearse con `new Date(str)`: eso da
      // medianoche UTC, que en Ecuador (UTC-5) cae la noche anterior y
      // excluye el día completo pedido en "to".
      if (filters.from) {
        const [fy, fm, fd] = filters.from.split('-').map(Number);
        where.createdAt.gte = new Date(fy, fm - 1, fd, 0, 0, 0, 0);
      }

      if (filters.to) {
        const [ty, tm, td] = filters.to.split('-').map(Number);
        where.createdAt.lte = new Date(ty, tm - 1, td, 23, 59, 59, 999);
      }
    }

    const incidents = await this.prisma.incident.findMany({
      where,
      include: {
        user: { select: USER_REF_SELECT },
        reviewedBy: { select: REVIEWER_REF_SELECT },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return incidents.map((i) => ({
      ...i,
      user: flattenUserRef(i.user),
      reviewedBy: flattenReviewerRef(i.reviewedBy),
    }));
  }

  async findMine(
    userId: string,
  ) {
    const incidents = await this.prisma.incident.findMany({
      where: {
        userId,
      },
      include: {
        reviewedBy: { select: REVIEWER_REF_SELECT },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return incidents.map((i) => ({
      ...i,
      reviewedBy: flattenReviewerRef(i.reviewedBy),
    }));
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
          user: { select: USER_REF_SELECT },
          reviewedBy: { select: REVIEWER_REF_SELECT },
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

    return {
      ...incident,
      user: flattenUserRef(incident.user),
      reviewedBy: flattenReviewerRef(incident.reviewedBy),
    };
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
