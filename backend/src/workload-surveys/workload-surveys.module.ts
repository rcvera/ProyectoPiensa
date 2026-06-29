import { Module } from '@nestjs/common';
import { WorkloadSurveysService } from './workload-surveys.service';
import { WorkloadSurveysController } from './workload-surveys.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkloadSurveysController],
  providers: [WorkloadSurveysService],
  exports: [WorkloadSurveysService],
})
export class WorkloadSurveysModule {}
