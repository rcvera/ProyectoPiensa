import {
  Controller,
  Get,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { ReportsService } from './reports.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('reports')
export class ReportsController {

  constructor(
    private readonly reportsService:
      ReportsService,
  ) {}
  @Roles('ADMIN')
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
  @Roles('ADMIN')
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

  @Roles('ADMIN')
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

  @Roles('ADMIN')
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
