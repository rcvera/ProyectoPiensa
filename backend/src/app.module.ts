import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ShiftsModule } from './shifts/shifts.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule, 
    UsersModule, ShiftsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
