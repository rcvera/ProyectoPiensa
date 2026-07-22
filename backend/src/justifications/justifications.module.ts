import { Module } from '@nestjs/common';

import { JustificationsController } from './justifications.controller';
import { JustificationsService } from './justifications.service';

import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
  ],
  controllers: [JustificationsController],
  providers: [JustificationsService],
})
export class JustificationsModule {}
