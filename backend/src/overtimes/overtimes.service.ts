import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkloadSurveysService } from '../workload-surveys/workload-surveys.service';
import { MailService } from '../mail/mail.service';

const MONTHLY_OVERTIME_LIMIT = 48;

@Injectable()
export class OvertimesService {

  constructor(
    private prisma: PrismaService,
    private surveys: WorkloadSurveysService,
    private mail: MailService,
  ) {}

  async generateOvertime(attendanceId: string) {

    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance || !attendance.checkOut) return;

    const { checkIn, checkOut } = attendance;

    const workedHours = (checkOut.getTime() - checkIn.getTime()) / 3600000;

    // Art. 52 del Código del Trabajo: el trabajo en sábado/domingo (descanso
    // obligatorio) se recarga al 100% sobre TODAS las horas trabajadas ese
    // día, no solo el excedente de 8h.
    const isRestDay = checkIn.getDay() === 0 || checkIn.getDay() === 6;

    let overtimeHours: number;
    let overtimeHours50: number;
    let overtimeHours100: number;

    if (isRestDay) {
      overtimeHours = workedHours;
      overtimeHours50 = 0;
      overtimeHours100 = workedHours;
    } else {
      // Art. 55: horas suplementarias (excedente de la jornada de 8h) se
      // recargan al 50% en horario diurno (06:00-24:00) y al 100% en
      // horario nocturno (00:00-06:00).
      overtimeHours = Math.max(workedHours - 8, 0);
      const overtimeStart = new Date(checkIn.getTime() + 8 * 3600000);
      const nightHours =
        overtimeHours > 0
          ? Math.min(this.nocturnalHours(overtimeStart, checkOut), overtimeHours)
          : 0;
      overtimeHours100 = nightHours;
      overtimeHours50 = overtimeHours - nightHours;
    }

    const record = await this.prisma.overtime.create({
      data: {
        userId: attendance.userId,
        attendanceId: attendance.id,
        workedHours,
        overtimeHours,
        overtimeHours50,
        overtimeHours100,
        date: attendance.checkIn,
      },
    });

    // Verificar límite mensual de horas extra
    if (overtimeHours > 0) {
      const month = attendance.checkIn.getMonth() + 1;
      const year = attendance.checkIn.getFullYear();
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

      const monthlyRecords = await this.prisma.overtime.findMany({
        where: {
          userId: attendance.userId,
          date: { gte: monthStart, lte: monthEnd },
        },
      });

      const totalMonthly = monthlyRecords.reduce((s, r) => s + r.overtimeHours, 0);

      if (totalMonthly >= MONTHLY_OVERTIME_LIMIT) {
        const alreadyAlerted = await this.prisma.workloadSurvey.findUnique({
          where: { userId_month_year: { userId: attendance.userId, month, year } },
        });

        if (alreadyAlerted) {
          return record;
        }

        // Notificar al empleado
        await this.prisma.notification.create({
          data: {
            userId: attendance.userId,
            title: '⚠️ Límite de horas extra alcanzado',
            message: `Has acumulado ${totalMonthly.toFixed(1)} horas extra este mes (límite: ${MONTHLY_OVERTIME_LIMIT} h). Por favor completa la encuesta de sobrecarga laboral.`,
          },
        });

        // Notificar a administradores
        const admins = await this.prisma.user.findMany({
          where: { role: 'ADMIN', active: true },
          select: { id: true },
        });

        const user = await this.prisma.user.findUnique({
          where: { id: attendance.userId },
          select: { email: true, employee: { select: { name: true } } },
        });
        const userName = user?.employee?.name ?? user?.email;

        if (admins.length > 0 && user) {
          await this.prisma.notification.createMany({
            data: admins.map((a) => ({
              userId: a.id,
              title: '⚠️ Empleado con sobrecarga laboral',
              message: `${userName} ha superado las ${MONTHLY_OVERTIME_LIMIT} horas extra en ${month}/${year} (total: ${totalMonthly.toFixed(1)} h).`,
            })),
          });
        }

        // Crear encuesta pendiente (una por mes)
        await this.surveys.createIfNotExists(attendance.userId, month, year);

        // Notificar al empleado por correo
        if (user) {
          await this.mail.sendWorkloadSurveyAlert(
            userName!,
            user.email,
            totalMonthly,
            MONTHLY_OVERTIME_LIMIT,
            month,
            year,
          );
        }
      }
    }

    return record;
  }

  /** Horas de [start, end) que caen dentro del horario nocturno (00:00-06:00). */
  private nocturnalHours(start: Date, end: Date): number {
    if (end <= start) return 0;

    let total = 0;
    let cursor = start;

    while (cursor < end) {
      const dayStart = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
      );
      const nightEnd = new Date(dayStart.getTime() + 6 * 3600000);
      const nextDayStart = new Date(dayStart.getTime() + 24 * 3600000);

      const segStart = cursor > dayStart ? cursor : dayStart;
      const segEnd = end < nightEnd ? end : nightEnd;
      if (segEnd > segStart) {
        total += (segEnd.getTime() - segStart.getTime()) / 3600000;
      }

      cursor = nextDayStart;
    }

    return total;
  }

  async findAll() {
    const records = await this.prisma.overtime.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            active: true,
            employee: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return records.map((r) => {
      const { employee, ...user } = r.user;
      return {
        ...r,
        user: { ...user, name: employee?.name ?? user.email },
      };
    });
  }

  async getWeekSummary(userId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const records = await this.prisma.overtime.findMany({
      where: { userId, date: { gte: fromDate, lte: toDate } },
    });

    const workedHours = records.reduce((s, r) => s + r.workedHours, 0);
    const overtimeHours = records.reduce((s, r) => s + r.overtimeHours, 0);
    const overtimeHours50 = records.reduce((s, r) => s + r.overtimeHours50, 0);
    const overtimeHours100 = records.reduce((s, r) => s + r.overtimeHours100, 0);

    return {
      workedHours: Math.round(workedHours * 10) / 10,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      overtimeHours50: Math.round(overtimeHours50 * 10) / 10,
      overtimeHours100: Math.round(overtimeHours100 * 10) / 10,
    };
  }
}
