import { Module } from '@nestjs/common';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OvertimesModule } from '../overtimes/overtimes.module';

@Module({
  imports: [
    PrismaModule,
    OvertimesModule, // ← IMPORTANTE
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}