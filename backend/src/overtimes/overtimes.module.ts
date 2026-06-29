import { Module } from '@nestjs/common';
import { OvertimesService } from './overtimes.service';
import { OvertimesController } from './overtimes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkloadSurveysModule } from '../workload-surveys/workload-surveys.module';

@Module({
  imports: [PrismaModule, WorkloadSurveysModule],
  controllers: [OvertimesController],
  providers: [OvertimesService],
  exports: [OvertimesService],
})
export class OvertimesModule {}