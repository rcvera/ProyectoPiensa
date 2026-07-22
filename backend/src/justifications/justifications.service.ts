import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import { CreateJustificationDto } from './dto/create-justification.dto';
import { RespondJustificationDto } from './dto/respond-justification.dto';
import { FilterJustificationsDto } from './dto/filter-justifications.dto';

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
export class JustificationsService {

  constructor(
    private readonly prisma:
      PrismaService,
    private readonly notificationsService:
      NotificationsService,
  ) {}

  async create(
    userId: string,
    dto: CreateJustificationDto,
    documentUrl: string | null,
  ) {

    const justification =
      await this.prisma.justification.create({
        data: {
          userId,
          date: new Date(dto.date),
          type: dto.type,
          description: dto.description,
          documentUrl: documentUrl ?? undefined,
        },
        include: {
          user: { select: USER_REF_SELECT },
        },
      });

    await this.notificationsService.notifyNewJustification({
      ...justification,
      user: flattenUserRef(justification.user) as any,
    });

    return {
      ...justification,
      user: flattenUserRef(justification.user),
    };
  }

  async findAll(
    filters: FilterJustificationsDto,
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
      where.date = {};
      if (filters.from) where.date.gte = new Date(filters.from);
      if (filters.to) where.date.lte = new Date(filters.to);
    }

    const justifications = await this.prisma.justification.findMany({
      where,
      include: {
        user: { select: USER_REF_SELECT },
        reviewedBy: { select: REVIEWER_REF_SELECT },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return justifications.map((j) => ({
      ...j,
      user: flattenUserRef(j.user),
      reviewedBy: flattenReviewerRef(j.reviewedBy),
    }));
  }

  async findMine(
    userId: string,
  ) {
    const justifications = await this.prisma.justification.findMany({
      where: {
        userId,
      },
      include: {
        reviewedBy: { select: REVIEWER_REF_SELECT },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return justifications.map((j) => ({
      ...j,
      reviewedBy: flattenReviewerRef(j.reviewedBy),
    }));
  }

  async findOne(
    id: string,
    callerId: string,
    callerRole: string,
  ) {

    const justification =
      await this.prisma.justification.findUnique({
        where: {
          id,
        },
        include: {
          user: { select: USER_REF_SELECT },
          reviewedBy: { select: REVIEWER_REF_SELECT },
        },
      });

    if (!justification) {
      throw new NotFoundException(
        'Justificación no encontrada',
      );
    }

    const isPrivileged =
      callerRole === 'ADMIN'
      || callerRole === 'SUPERVISOR';

    if (
      !isPrivileged
      && justification.userId !== callerId
    ) {
      throw new ForbiddenException(
        'No autorizado',
      );
    }

    return {
      ...justification,
      user: flattenUserRef(justification.user),
      reviewedBy: flattenReviewerRef(justification.reviewedBy),
    };
  }

  async respond(
    id: string,
    reviewerId: string,
    dto: RespondJustificationDto,
  ) {

    const existing =
      await this.prisma.justification.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Justificación no encontrada',
      );
    }

    const updated =
      await this.prisma.justification.update({
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

    await this.notificationsService.notifyJustificationResponse(
      updated,
    );

    return updated;
  }
}
