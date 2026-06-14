import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getEmployees() {
    return this.prisma.user.findMany();
  }

  async getOvertimes() {
    return this.prisma.overtime.findMany({
      include: {
        user: true,
      },
    });
  }

  async generateEmployeesExcel() {

    const employees =
      await this.getEmployees();

    const workbook =
      new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet(
        'Empleados',
      );

    sheet.columns = [
      {
        header: 'Nombre',
        key: 'name',
      },
      {
        header: 'Correo',
        key: 'email',
      },
      {
        header: 'Rol',
        key: 'role',
      },
      {
        header: 'Estado',
        key: 'active',
      },
    ];

    employees.forEach((e) => {
      sheet.addRow({
        name: e.name,
        email: e.email,
        position: e.position,
        active:
          e.active
            ? 'Activo'
            : 'Inactivo',
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  async generateOvertimeExcel() {

    const data =
      await this.getOvertimes();

    const workbook =
      new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet(
        'Horas Extras',
      );

    sheet.columns = [
      {
        header: 'Empleado',
        key: 'employee',
      },
      {
        header: 'Horas Trabajadas',
        key: 'worked',
      },
      {
        header: 'Horas Extras',
        key: 'overtime',
      },
    ];

    data.forEach((o) => {
      sheet.addRow({
        employee:
          o.user.name,
        worked:
          o.workedHours,
        overtime:
          o.overtimeHours,
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  async generateEmployeesPDF() {

    const employees =
      await this.getEmployees();

    const doc =
      new PDFDocument();

    const buffers = [];

    doc.on(
      'data',
      buffers.push.bind(buffers),
    );

    doc.fontSize(20);

    doc.text(
      'Reporte de Empleados',
    );

    doc.moveDown();

    employees.forEach((e) => {
      doc.text(
        `${e.name} - ${e.email}`,
      );
    });

    doc.end();

    return new Promise<Buffer>(
      (resolve) => {
        doc.on(
          'end',
          () => {
            resolve(
              Buffer.concat(
                buffers,
              ),
            );
          },
        );
      },
    );
  }

  async generateOvertimePDF() {

    const data =
      await this.getOvertimes();

    const doc =
      new PDFDocument();

    const buffers = [];

    doc.on(
      'data',
      buffers.push.bind(buffers),
    );

    doc.fontSize(20);

    doc.text(
      'Reporte Horas Extras',
    );

    doc.moveDown();

    data.forEach((o) => {
      doc.text(
        `${o.user.name} | Horas Extras: ${o.overtimeHours}`,
      );
    });

    doc.end();

    return new Promise<Buffer>(
      (resolve) => {
        doc.on(
          'end',
          () => {
            resolve(
              Buffer.concat(
                buffers,
              ),
            );
          },
        );
      },
    );
  }
}