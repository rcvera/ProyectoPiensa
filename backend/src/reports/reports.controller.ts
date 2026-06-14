import {
  Controller,
  Get,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';

import { ReportsService }
from './reports.service';

@Controller('reports')
export class ReportsController {

  constructor(
    private readonly reportsService:
      ReportsService,
  ) {}

  @Get('employees/pdf')
  async employeesPDF(
    @Res() res: Response,
  ) {

    const pdf =
      await this.reportsService
        .generateEmployeesPDF();

    res.set({
      'Content-Type':
        'application/pdf',
      'Content-Disposition':
        'attachment; filename=empleados.pdf',
    });

    res.send(pdf);
  }

  @Get('employees/excel')
  async employeesExcel(
    @Res() res: Response,
  ) {

    const excel =
      await this.reportsService
        .generateEmployeesExcel();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename=empleados.xlsx',
    });

    res.send(excel);
  }

  @Get('overtimes/pdf')
  async overtimePDF(
    @Res() res: Response,
  ) {

    const pdf =
      await this.reportsService
        .generateOvertimePDF();

    res.set({
      'Content-Type':
        'application/pdf',
      'Content-Disposition':
        'attachment; filename=horas-extras.pdf',
    });

    res.send(pdf);
  }

  @Get('overtimes/excel')
  async overtimeExcel(
    @Res() res: Response,
  ) {

    const excel =
      await this.reportsService
        .generateOvertimeExcel();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename=horas-extras.xlsx',
    });

    res.send(excel);
  }
}