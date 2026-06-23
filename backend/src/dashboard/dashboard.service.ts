import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuthUser {
  id: string;
  role: string;
}

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getStats(user: AuthUser) {
    if (user.role === 'EMPLOYEE') {
      return this.getEmployeeStats(user.id);
    }
    return this.getGlobalStats();
  }

  private async getGlobalStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [employees, shifts, attendancesToday, incidents, incidentsByDay] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.shift.count(),
        this.prisma.attendance.count({
          where: { checkIn: { gte: today } },
        }),
        this.prisma.incident.count(),
        this.getIncidentsThisWeek(),
      ]);

    return {
      employees,
      shifts,
      attendancesToday,
      incidents,
      incidentsByDay,
    };
  }

  private async getEmployeeStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [assignedShifts, attendancesToday, incidents, incidentsByDay] =
      await Promise.all([
        this.prisma.assignment.count({
          where: { userId },
        }),
        this.prisma.attendance.count({
          where: { userId, checkIn: { gte: today } },
        }),
        this.prisma.incident.count({
          where: { userId },
        }),
        this.getIncidentsThisWeek(userId),
      ]);

    return {
      assignedShifts,
      attendancesToday,
      incidents,
      incidentsByDay,
    };
  }

  private async getIncidentsThisWeek(userId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay();
    const daysFromMonday =
      dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(today);
    monday.setDate(
      today.getDate() - daysFromMonday,
    );

    const nextMonday = new Date(monday);
    nextMonday.setDate(
      monday.getDate() + 7,
    );

    const recent =
      await this.prisma.incident.findMany({
        where: {
          ...(userId ? { userId } : {}),
          createdAt: {
            gte: monday,
            lt: nextMonday,
          },
        },
        select: { createdAt: true },
      });

    const buckets = new Map<string, number>();

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      buckets.set(this.dayKey(d), 0);
    }

    for (const inc of recent) {
      const key = this.dayKey(inc.createdAt);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }

    return Array.from(buckets.entries()).map(
      ([day, count]) => ({ day, count }),
    );
  }

  private dayKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }
}