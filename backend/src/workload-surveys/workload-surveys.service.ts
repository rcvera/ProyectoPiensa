import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkloadSurveysService {
  constructor(private prisma: PrismaService) {}

  async getPending(userId: string) {
    return this.prisma.workloadSurvey.findFirst({
      where: { userId, completedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respond(
    id: string,
    userId: string,
    dto: {
      hoursFeeling: number;
      physicalLoad: number;
      emotionalLoad: number;
      comments?: string;
    },
  ) {
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

  async createIfNotExists(userId: string, month: number, year: number) {
    const existing = await this.prisma.workloadSurvey.findUnique({
      where: { userId_month_year: { userId, month, year } },
    });
    if (existing) return existing;

    return this.prisma.workloadSurvey.create({
      data: { userId, month, year },
    });
  }

  async findAll() {
    return this.prisma.workloadSurvey.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
