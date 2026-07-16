import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

// Ecuador: Código del Trabajo — aporte personal IESS y aporte patronal IESS.
const IESS_PERSONAL_RATE = 0.0945;
const IESS_PATRONAL_RATE = 0.1115;

// Divisores estándar para el valor hora/día (jornada de 8h, mes de 30 días).
const MONTHLY_HOURS = 240;
const MONTHLY_DAYS = 30;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Para DateTime reales (Attendance.checkIn): el instante debe leerse en hora local.
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Para columnas @db.Date (Assignment.date): Prisma las devuelve ancladas a
// medianoche UTC. Leerlas con getters locales las corre un día en zonas con
// offset negativo (Ecuador, UTC-5), por lo que deben leerse en UTC.
function dateOnlyKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

function flattenPayslip(p: any) {
  const { user, ...rest } = p;
  return {
    ...rest,
    user: user
      ? {
          id: user.id,
          email: user.email,
          name: user.employee?.name ?? user.email,
        }
      : undefined,
  };
}

@Injectable()
export class PayrollService {

  constructor(private prisma: PrismaService) {}

  /** Días esperados/trabajados/faltas y minutos de atraso en [rangeStart, rangeEnd]. */
  async computeAttendanceMetrics(userId: string, rangeStart: Date, rangeEnd: Date) {

    const assignments = await this.prisma.assignment.findMany({
      where: {
        userId,
        published: true,
        date: { gte: rangeStart, lte: rangeEnd },
      },
      include: { shift: true },
    });

    const assignmentsByDay = new Map(
      assignments.map((a) => [dateOnlyKey(a.date), a]),
    );

    const expectedDays = assignments.length;

    const attendances = await this.prisma.attendance.findMany({
      where: {
        userId,
        checkIn: { gte: rangeStart, lte: rangeEnd },
      },
    });

    const workedDays = new Set(
      attendances.map((a) => dayKey(a.checkIn)),
    ).size;

    const absenceDays = Math.max(expectedDays - workedDays, 0);

    let lateMinutes = 0;
    for (const attendance of attendances) {
      const assignment = assignmentsByDay.get(dayKey(attendance.checkIn));
      const startTime = assignment?.shift?.startTime;
      if (!startTime) continue;

      const [shiftHour, shiftMin] = startTime.split(':').map(Number);
      const shiftMinutes = shiftHour * 60 + shiftMin;
      const checkInMinutes =
        attendance.checkIn.getHours() * 60 + attendance.checkIn.getMinutes();

      if (checkInMinutes > shiftMinutes) {
        lateMinutes += checkInMinutes - shiftMinutes;
      }
    }

    return { expectedDays, workedDays, absenceDays, lateMinutes };
  }

  /** Faltas y atrasos de todos los empleados activos en [from, to], con el descuento estimado. */
  async getAttendanceFaltas(from: string, to: string) {

    // "YYYY-MM-DD" se parsea manualmente: `new Date(str)` interpreta fechas
    // sin hora como medianoche UTC, que en zonas con offset negativo
    // (Ecuador, UTC-5) cae la tarde/noche del día local ANTERIOR — un
    // .setHours(0,0,0,0) posterior fijaría entonces la medianoche local de
    // ese día anterior, no la del día pedido.
    const [fy, fm, fd] = from.split('-').map(Number);
    const rangeStart = new Date(fy, fm - 1, fd, 0, 0, 0, 0);
    const [ty, tm, td] = to.split('-').map(Number);
    const rangeEnd = new Date(ty, tm - 1, td, 23, 59, 59, 999);

    const employees = await this.prisma.employee.findMany({
      where: { user: { active: true } },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { name: 'asc' },
    });

    const results: any[] = [];
    for (const employee of employees) {
      const metrics = await this.computeAttendanceMetrics(
        employee.userId,
        rangeStart,
        rangeEnd,
      );

      if (metrics.expectedDays === 0) continue;

      const dailyRate = employee.baseSalary != null ? employee.baseSalary / MONTHLY_DAYS : null;
      const minuteRate = employee.baseSalary != null ? employee.baseSalary / MONTHLY_HOURS / 60 : null;

      results.push({
        userId: employee.userId,
        name: employee.name,
        email: employee.user.email,
        ...metrics,
        absenceDeduction: dailyRate != null ? round2(metrics.absenceDays * dailyRate) : null,
        lateDeduction: minuteRate != null ? round2(metrics.lateMinutes * minuteRate) : null,
      });
    }

    return results;
  }

  async generatePayslip(userId: string, month: number, year: number) {

    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    if (employee.baseSalary == null) {
      throw new BadRequestException(
        'El empleado no tiene sueldo base configurado',
      );
    }

    const baseSalary = employee.baseSalary;

    const monthStart = new Date(year, month - 1, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const { expectedDays, workedDays, absenceDays, lateMinutes } =
      await this.computeAttendanceMetrics(userId, monthStart, monthEnd);

    const overtimes = await this.prisma.overtime.findMany({
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
    });

    const overtimeHours50 = overtimes.reduce((s, o) => s + o.overtimeHours50, 0);
    const overtimeHours100 = overtimes.reduce((s, o) => s + o.overtimeHours100, 0);

    const hourlyRate = baseSalary / MONTHLY_HOURS;
    const dailyRate = baseSalary / MONTHLY_DAYS;
    const minuteRate = hourlyRate / 60;

    const overtimePay =
      overtimeHours50 * hourlyRate * 1.5 + overtimeHours100 * hourlyRate * 2;

    const grossIncome = baseSalary + overtimePay;
    const iessPersonal = grossIncome * IESS_PERSONAL_RATE;
    const iessPatronal = grossIncome * IESS_PATRONAL_RATE;
    const absenceDeduction = absenceDays * dailyRate;
    const lateDeduction = lateMinutes * minuteRate;
    const netPay = grossIncome - iessPersonal - absenceDeduction - lateDeduction;

    const data = {
      userId,
      month,
      year,
      baseSalary: round2(baseSalary),
      expectedDays,
      workedDays,
      absenceDays,
      lateMinutes: Math.round(lateMinutes),
      overtimeHours50: round2(overtimeHours50),
      overtimeHours100: round2(overtimeHours100),
      overtimePay: round2(overtimePay),
      grossIncome: round2(grossIncome),
      iessPersonal: round2(iessPersonal),
      iessPatronal: round2(iessPatronal),
      absenceDeduction: round2(absenceDeduction),
      lateDeduction: round2(lateDeduction),
      netPay: round2(netPay),
    };

    const record = await this.prisma.payslip.upsert({
      where: { userId_month_year: { userId, month, year } },
      create: data,
      update: data,
      include: {
        user: { select: { id: true, email: true, employee: { select: { name: true } } } },
      },
    });

    return flattenPayslip(record);
  }

  async generateForAll(month: number, year: number) {

    const employees = await this.prisma.employee.findMany({
      where: {
        baseSalary: { not: null },
        user: { active: true },
      },
      select: { userId: true },
    });

    const results: any[] = [];
    for (const e of employees) {
      results.push(await this.generatePayslip(e.userId, month, year));
    }

    return results;
  }

  async findAll(month?: number, year?: number) {

    const where: any = {};
    if (month) where.month = month;
    if (year) where.year = year;

    const records = await this.prisma.payslip.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, employee: { select: { name: true } } } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return records.map(flattenPayslip);
  }

  async findByUser(userId: string, month?: number, year?: number) {

    const where: any = { userId };
    if (month) where.month = month;
    if (year) where.year = year;

    const records = await this.prisma.payslip.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return records;
  }
}
