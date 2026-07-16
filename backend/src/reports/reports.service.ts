import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayrollService } from '../payroll/payroll.service';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private payrollService: PayrollService,
  ) {}

  private readonly ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrador',
    SUPERVISOR: 'Supervisor',
    EMPLOYEE: 'Empleado',
  };

  async getEmployees() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        employee: {
          select: {
            name: true,
            cedula: true,
            phone: true,
            position: { select: { name: true } },
          },
        },
      },
      orderBy: { employee: { name: 'asc' } },
    });
    return users.map((u) => ({
      ...u,
      name: u.employee?.name ?? u.email,
      cedula: u.employee?.cedula ?? '',
      phone: u.employee?.phone ?? '',
      position: u.employee?.position?.name ?? '',
      roleLabel: this.ROLE_LABELS[u.role] ?? u.role,
    }));
  }

  async getOvertimes() {
    const records = await this.prisma.overtime.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employee: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    return records.map((o) => ({
      ...o,
      user: {
        ...o.user,
        name: o.user.employee?.name ?? o.user.email,
      },
    }));
  }

  async getAttendanceFaltas(from: string, to: string) {
    return this.payrollService.getAttendanceFaltas(from, to);
  }

  async getPayroll(month: number, year: number) {
    return this.payrollService.findAll(month, year);
  }

  private styleExcelSheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    title: string,
    columns: { header: string; key: string; width: number }[],
    rows: Record<string, any>[],
  ) {
    const sheet = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', ySplit: 4 }],
    });

    const lastCol = String.fromCharCode(
      64 + columns.length,
    );

    sheet.mergeCells(`A1:${lastCol}1`);
    sheet.getCell('A1').value = 'AutoWash Control';
    sheet.getCell('A1').font = {
      size: 16,
      bold: true,
      color: { argb: 'FF1677FF' },
    };

    sheet.mergeCells(`A2:${lastCol}2`);
    sheet.getCell('A2').value = title;
    sheet.getCell('A2').font = { size: 12, bold: true };

    sheet.mergeCells(`A3:${lastCol}3`);
    sheet.getCell('A3').value =
      `Generado el ${new Date().toLocaleString('es-EC', { dateStyle: 'long', timeStyle: 'short' })}`;
    sheet.getCell('A3').font = {
      size: 9,
      italic: true,
      color: { argb: 'FF888888' },
    };

    sheet.columns = columns.map((c) => ({
      key: c.key,
      width: c.width,
    }));

    const headerRow = sheet.getRow(4);
    columns.forEach((c, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = c.header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1677FF' },
      };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      };
    });
    headerRow.height = 20;

    rows.forEach((row, i) => {
      const excelRow = sheet.addRow(row);
      excelRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFF0F0F0' } },
          bottom: { style: 'thin', color: { argb: 'FFF0F0F0' } },
          left: { style: 'thin', color: { argb: 'FFF0F0F0' } },
          right: { style: 'thin', color: { argb: 'FFF0F0F0' } },
        };
        if (i % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F7FA' },
          };
        }
      });
    });

    return sheet;
  }

  async generateEmployeesExcel() {

    const employees =
      await this.getEmployees();

    const workbook =
      new ExcelJS.Workbook();
    workbook.creator = 'AutoWash Control';
    workbook.created = new Date();

    this.styleExcelSheet(
      workbook,
      'Empleados',
      'Reporte de Empleados',
      [
        { header: 'Nombre', key: 'name', width: 28 },
        { header: 'Cédula', key: 'cedula', width: 16 },
        { header: 'Correo', key: 'email', width: 30 },
        { header: 'Rol', key: 'roleLabel', width: 16 },
        { header: 'Cargo', key: 'position', width: 20 },
        { header: 'Teléfono', key: 'phone', width: 16 },
        { header: 'Estado', key: 'active', width: 12 },
      ],
      employees.map((e) => ({
        name: e.name,
        cedula: e.cedula || '—',
        email: e.email,
        roleLabel: e.roleLabel,
        position: e.position || '—',
        phone: e.phone || '—',
        active: e.active ? 'Activo' : 'Inactivo',
      })),
    );

    return workbook.xlsx.writeBuffer();
  }

  async generateOvertimeExcel() {

    const data =
      await this.getOvertimes();

    const workbook =
      new ExcelJS.Workbook();
    workbook.creator = 'AutoWash Control';
    workbook.created = new Date();

    this.styleExcelSheet(
      workbook,
      'Horas Extras',
      'Reporte de Horas Extras',
      [
        { header: 'Empleado', key: 'employee', width: 28 },
        { header: 'Fecha', key: 'date', width: 16 },
        { header: 'Horas Trabajadas', key: 'worked', width: 18 },
        { header: 'Horas Extras', key: 'overtime', width: 16 },
      ],
      data.map((o) => ({
        employee: o.user.name,
        date: new Date(o.date).toLocaleDateString('es-EC'),
        worked: Math.round(o.workedHours * 10) / 10,
        overtime: Math.round(o.overtimeHours * 10) / 10,
      })),
    );

    return workbook.xlsx.writeBuffer();
  }

  private drawPdfHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    subtitle: string,
  ) {
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#1677ff')
      .text('AutoWash Control', left, 40);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#888888')
      .text('Sistema de Gestión de Turnos', left, 62);

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#1f1f1f')
      .text(title, left, 92);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#888888')
      .text(
        `Generado el ${new Date().toLocaleString('es-EC', { dateStyle: 'long', timeStyle: 'short' })} · ${subtitle}`,
        left,
        112,
      );

    doc
      .moveTo(left, 132)
      .lineTo(right, 132)
      .strokeColor('#e0e0e0')
      .lineWidth(1)
      .stroke();

    return 145;
  }

  private drawPdfTable(
    doc: PDFKit.PDFDocument,
    startY: number,
    columns: { header: string; key: string; width: number; align?: 'left' | 'right' | 'center' }[],
    rows: Record<string, any>[],
  ) {
    const left = doc.page.margins.left;
    const tableWidth = columns.reduce((s, c) => s + c.width, 0);
    const rowHeight = 22;
    const pageBottom = doc.page.height - doc.page.margins.bottom;

    const drawHeaderRow = (y: number) => {
      doc.rect(left, y, tableWidth, rowHeight).fill('#1677ff');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
      let x = left;
      columns.forEach((c) => {
        doc.text(c.header, x + 6, y + 7, {
          width: c.width - 12,
          align: c.align ?? 'left',
        });
        x += c.width;
      });
      return y + rowHeight;
    };

    let y = drawHeaderRow(startY);
    doc.font('Helvetica').fontSize(9);

    rows.forEach((row, i) => {
      if (y + rowHeight > pageBottom) {
        doc.addPage();
        y = drawHeaderRow(doc.page.margins.top);
        doc.font('Helvetica').fontSize(9);
      }

      if (i % 2 === 1) {
        doc.rect(left, y, tableWidth, rowHeight).fill('#f5f7fa');
      }

      doc.fillColor('#1f1f1f');
      let x = left;
      columns.forEach((c) => {
        doc.text(String(row[c.key] ?? '—'), x + 6, y + 7, {
          width: c.width - 12,
          align: c.align ?? 'left',
        });
        x += c.width;
      });
      y += rowHeight;
    });

    doc
      .moveTo(left, y)
      .lineTo(left + tableWidth, y)
      .strokeColor('#e0e0e0')
      .stroke();

    return y;
  }

  private drawPdfFooters(doc: PDFKit.PDFDocument) {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const bottom = doc.page.height - doc.page.margins.bottom - 12;
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#aaaaaa')
        .text(
          `Página ${i + 1} de ${range.count}`,
          doc.page.margins.left,
          bottom,
          {
            width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
            align: 'center',
            lineBreak: false,
          },
        );
    }
  }

  async generateEmployeesPDF() {

    const employees =
      await this.getEmployees();

    const doc = new PDFDocument({
      margin: 40,
      bufferPages: true,
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    const startY = this.drawPdfHeader(
      doc,
      'Reporte de Empleados',
      `${employees.length} empleado(s)`,
    );

    this.drawPdfTable(
      doc,
      startY,
      [
        { header: 'Nombre', key: 'name', width: 125 },
        { header: 'Cédula', key: 'cedula', width: 70 },
        { header: 'Correo', key: 'email', width: 130 },
        { header: 'Rol', key: 'roleLabel', width: 70 },
        { header: 'Cargo', key: 'position', width: 65 },
        { header: 'Estado', key: 'active', width: 52 },
      ],
      employees.map((e) => ({
        name: e.name,
        cedula: e.cedula || '—',
        email: e.email,
        roleLabel: e.roleLabel,
        position: e.position || '—',
        active: e.active ? 'Activo' : 'Inactivo',
      })),
    );

    this.drawPdfFooters(doc);
    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  async generateOvertimePDF() {

    const data =
      await this.getOvertimes();

    const doc = new PDFDocument({
      margin: 40,
      bufferPages: true,
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    const totalOvertime = data.reduce(
      (s, o) => s + o.overtimeHours,
      0,
    );

    const startY = this.drawPdfHeader(
      doc,
      'Reporte de Horas Extras',
      `${data.length} registro(s) · ${Math.round(totalOvertime * 10) / 10}h extra en total`,
    );

    this.drawPdfTable(
      doc,
      startY,
      [
        { header: 'Empleado', key: 'employee', width: 200 },
        { header: 'Fecha', key: 'date', width: 105 },
        { header: 'H. Trabajadas', key: 'worked', width: 100, align: 'right' },
        { header: 'H. Extras', key: 'overtime', width: 90, align: 'right' },
      ],
      data.map((o) => ({
        employee: o.user.name,
        date: new Date(o.date).toLocaleDateString('es-EC'),
        worked: (Math.round(o.workedHours * 10) / 10).toFixed(1),
        overtime: (Math.round(o.overtimeHours * 10) / 10).toFixed(1),
      })),
    );

    this.drawPdfFooters(doc);
    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  async generateAttendanceExcel(from: string, to: string) {

    const data = await this.getAttendanceFaltas(from, to);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AutoWash Control';
    workbook.created = new Date();

    this.styleExcelSheet(
      workbook,
      'Asistencia',
      `Reporte de Asistencia (Faltas) · ${from} a ${to}`,
      [
        { header: 'Empleado', key: 'name', width: 28 },
        { header: 'Correo', key: 'email', width: 30 },
        { header: 'Días Esperados', key: 'expectedDays', width: 16 },
        { header: 'Días Trabajados', key: 'workedDays', width: 16 },
        { header: 'Faltas', key: 'absenceDays', width: 10 },
        { header: 'Descuento Faltas', key: 'absenceDeduction', width: 16 },
        { header: 'Atrasos (min)', key: 'lateMinutes', width: 14 },
        { header: 'Descuento Atrasos', key: 'lateDeduction', width: 16 },
      ],
      data.map((r) => ({
        name: r.name,
        email: r.email,
        expectedDays: r.expectedDays,
        workedDays: r.workedDays,
        absenceDays: r.absenceDays,
        absenceDeduction: r.absenceDeduction != null ? `$${r.absenceDeduction.toFixed(2)}` : '—',
        lateMinutes: r.lateMinutes,
        lateDeduction: r.lateDeduction != null ? `$${r.lateDeduction.toFixed(2)}` : '—',
      })),
    );

    return workbook.xlsx.writeBuffer();
  }

  async generateAttendancePDF(from: string, to: string) {

    const data = await this.getAttendanceFaltas(from, to);

    const doc = new PDFDocument({ margin: 40, bufferPages: true });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    const totalFaltas = data.reduce((s, r) => s + r.absenceDays, 0);

    const startY = this.drawPdfHeader(
      doc,
      'Reporte de Asistencia (Faltas)',
      `${from} a ${to} · ${data.length} empleado(s) · ${totalFaltas} falta(s) en total`,
    );

    this.drawPdfTable(
      doc,
      startY,
      [
        { header: 'Empleado', key: 'name', width: 160 },
        { header: 'Días Esp.', key: 'expectedDays', width: 60, align: 'right' },
        { header: 'Días Trab.', key: 'workedDays', width: 60, align: 'right' },
        { header: 'Faltas', key: 'absenceDays', width: 50, align: 'right' },
        { header: 'Desc. Faltas', key: 'absenceDeduction', width: 80, align: 'right' },
        { header: 'Atrasos (min)', key: 'lateMinutes', width: 70, align: 'right' },
        { header: 'Desc. Atrasos', key: 'lateDeduction', width: 80, align: 'right' },
      ],
      data.map((r) => ({
        name: r.name,
        expectedDays: r.expectedDays,
        workedDays: r.workedDays,
        absenceDays: r.absenceDays,
        absenceDeduction: r.absenceDeduction != null ? `$${r.absenceDeduction.toFixed(2)}` : '—',
        lateMinutes: r.lateMinutes,
        lateDeduction: r.lateDeduction != null ? `$${r.lateDeduction.toFixed(2)}` : '—',
      })),
    );

    this.drawPdfFooters(doc);
    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  async generatePayrollExcel(month: number, year: number) {

    const data = await this.getPayroll(month, year);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AutoWash Control';
    workbook.created = new Date();

    this.styleExcelSheet(
      workbook,
      'Rol de Pagos',
      `Reporte de Pago · ${month}/${year}`,
      [
        { header: 'Empleado', key: 'name', width: 28 },
        { header: 'Sueldo Base', key: 'baseSalary', width: 14 },
        { header: 'H. Extra 50%', key: 'overtimeHours50', width: 14 },
        { header: 'H. Extra 100%', key: 'overtimeHours100', width: 14 },
        { header: 'Pago H. Extra', key: 'overtimePay', width: 14 },
        { header: 'Ingreso Bruto', key: 'grossIncome', width: 14 },
        { header: 'IESS Personal', key: 'iessPersonal', width: 14 },
        { header: 'Faltas', key: 'absenceDays', width: 10 },
        { header: 'Desc. Faltas', key: 'absenceDeduction', width: 14 },
        { header: 'Atrasos (min)', key: 'lateMinutes', width: 14 },
        { header: 'Desc. Atrasos', key: 'lateDeduction', width: 14 },
        { header: 'Líquido a Recibir', key: 'netPay', width: 16 },
      ],
      data.map((p: any) => ({
        name: p.user.name,
        baseSalary: `$${p.baseSalary.toFixed(2)}`,
        overtimeHours50: p.overtimeHours50.toFixed(2),
        overtimeHours100: p.overtimeHours100.toFixed(2),
        overtimePay: `$${p.overtimePay.toFixed(2)}`,
        grossIncome: `$${p.grossIncome.toFixed(2)}`,
        iessPersonal: `$${p.iessPersonal.toFixed(2)}`,
        absenceDays: p.absenceDays,
        absenceDeduction: `$${p.absenceDeduction.toFixed(2)}`,
        lateMinutes: p.lateMinutes,
        lateDeduction: `$${p.lateDeduction.toFixed(2)}`,
        netPay: `$${p.netPay.toFixed(2)}`,
      })),
    );

    return workbook.xlsx.writeBuffer();
  }

  async generatePayrollPDF(month: number, year: number) {

    const data = await this.getPayroll(month, year);

    const doc = new PDFDocument({ margin: 40, bufferPages: true });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    const totalNet = data.reduce((s: number, p: any) => s + p.netPay, 0);

    const startY = this.drawPdfHeader(
      doc,
      'Reporte de Pago',
      `${month}/${year} · ${data.length} empleado(s) · $${totalNet.toFixed(2)} líquido total`,
    );

    this.drawPdfTable(
      doc,
      startY,
      [
        { header: 'Empleado', key: 'name', width: 140 },
        { header: 'Sueldo Base', key: 'baseSalary', width: 65, align: 'right' },
        { header: 'H. Extra', key: 'overtimeHours', width: 55, align: 'right' },
        { header: 'IESS Pers.', key: 'iessPersonal', width: 60, align: 'right' },
        { header: 'Faltas', key: 'absenceDays', width: 40, align: 'right' },
        { header: 'Atrasos', key: 'lateMinutes', width: 50, align: 'right' },
        { header: 'Líquido', key: 'netPay', width: 65, align: 'right' },
      ],
      data.map((p: any) => ({
        name: p.user.name,
        baseSalary: `$${p.baseSalary.toFixed(2)}`,
        overtimeHours: (p.overtimeHours50 + p.overtimeHours100).toFixed(1),
        iessPersonal: `$${p.iessPersonal.toFixed(2)}`,
        absenceDays: p.absenceDays,
        lateMinutes: p.lateMinutes,
        netPay: `$${p.netPay.toFixed(2)}`,
      })),
    );

    this.drawPdfFooters(doc);
    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }
}