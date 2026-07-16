import { Module } from '@nestjs/common';

import { ReportsController }
from './reports.controller';

import { ReportsService }
from './reports.service';

import { PrismaModule }
from '../prisma/prisma.module';

import { PayrollModule }
from '../payroll/payroll.module';

@Module({
  imports: [PrismaModule, PayrollModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}