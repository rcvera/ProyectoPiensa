import { Module } from '@nestjs/common';
import { OvertimesService } from './overtimes.service';
import { OvertimesController } from './overtimes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OvertimesController],
  providers: [OvertimesService],
  exports: [OvertimesService], // ← IMPORTANTE
})
export class OvertimesModule {}