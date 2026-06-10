import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';

import { PrismaModule } from '../prisma/prisma.module';

import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN as any,
      },
    }),
  ],

  providers: [
    AuthService,
    JwtStrategy,
  ],

  controllers: [AuthController],
})
export class AuthModule {}