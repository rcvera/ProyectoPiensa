import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AnswerWorkloadSurveyDto } from './dto/answer-workload-survey.dto';

const USER_SELECT = {
  id: true,
  email: true,
  employee: { select: { name: true } },
};

function flattenUser(user: any) {
  if (!user) return user;
  const { employee, ...rest } = user;
  return { ...rest, name: employee?.name ?? user.email };
}

@Injectable()
export class WorkloadSurveysService {
  constructor(private prisma: PrismaService) {}

  async createIfNotExists(userId: string, month: number, year: number) {
    const existing = await this.prisma.workloadSurvey.findUnique({
      where: { userId_month_year: { userId, month, year } },
    });
    if (existing) return existing;

    return this.prisma.workloadSurvey.create({
      data: { userId, month, year },
    });
  }

  async findAll(month?: number, year?: number) {

    const where: any = {};
    if (month) where.month = month;
    if (year) where.year = year;

    const records = await this.prisma.workloadSurvey.findMany({
      where,
      include: {
        user: { select: USER_SELECT },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map((r) => ({
      ...r,
      user: flattenUser(r.user),
    }));
  }

  async findMine(userId: string) {

    const records = await this.prisma.workloadSurvey.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return records;
  }

  async answer(
    id: string,
    userId: string,
    dto: AnswerWorkloadSurveyDto,
  ) {

    const existing = await this.prisma.workloadSurvey.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Encuesta no encontrada');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('No autorizado');
    }

    return this.prisma.workloadSurvey.update({
      where: { id },
      data: {
        hoursFeeling: dto.hoursFeeling,
        physicalLoad: dto.physicalLoad,
        emotionalLoad: dto.emotionalLoad,
        comments: dto.comments,
        completedAt: new Date(),
      },
    });
  }
}
