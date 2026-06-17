import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getStats() {

    const employees =
      await this.prisma.user.count();

    const shifts =
      await this.prisma.shift.count();

    const attendancesToday =
      await this.prisma.attendance.count({
        where: {
          checkIn: {
            gte: new Date(
              new Date().setHours(
                0,
                0,
                0,
                0,
              ),
            ),
          },
        },
      });

    const incidents =
      await this.prisma.incident.count();

    const incidentsByDay =
      await this.getIncidentsThisWeek();

    return {
      employees,
      shifts,
      attendancesToday,
      incidents,
      incidentsByDay,
    };
  }

  private async getIncidentsThisWeek() {
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
          createdAt: {
            gte: monday,
            lt: nextMonday,
          },
        },
        select: { createdAt: true },
      });

    const buckets = new Map<
      string,
      number
    >();

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      buckets.set(this.dayKey(d), 0);
    }

    for (const inc of recent) {
      const key = this.dayKey(
        inc.createdAt,
      );
      if (buckets.has(key)) {
        buckets.set(
          key,
          (buckets.get(key) ?? 0) + 1,
        );
      }
    }

    return Array.from(
      buckets.entries(),
    ).map(([day, count]) => ({
      day,
      count,
    }));
  }

  private dayKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }
}