import { Module } from '@nestjs/common';

import { AttendancesController } from './attendances.controller';

import { AttendancesService } from './attendances.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}