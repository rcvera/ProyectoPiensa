import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AttendancesService } from './attendances.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequest } from '../auth/types/auth-request.type';

@UseGuards(JwtAuthGuard)
@Controller('attendances')
export class AttendancesController {

  constructor(
    private readonly attendancesService:
      AttendancesService,
  ) {}

  @Post('check-in')
  checkIn(
    @Req() request: AuthRequest,
    @Body() body: { userId?: string },
  ) {
    return this.attendancesService.checkIn(
      this.resolveTarget(request, body),
    );
  }

  @Post('break-start')
  breakStart(
    @Req() request: AuthRequest,
    @Body() body: { userId?: string },
  ) {
    return this.attendancesService.breakStart(
      this.resolveTarget(request, body),
    );
  }

  @Post('break-end')
  breakEnd(
    @Req() request: AuthRequest,
    @Body() body: { userId?: string },
  ) {
    return this.attendancesService.breakEnd(
      this.resolveTarget(request, body),
    );
  }

  @Post('check-out')
  checkOut(
    @Req() request: AuthRequest,
    @Body() body: { userId?: string },
  ) {
    return this.attendancesService.checkOut(
      this.resolveTarget(request, body),
    );
  }

  private resolveTarget(
    request: AuthRequest,
    body: { userId?: string },
  ): string {
    const isPrivileged =
      request.user.role === 'ADMIN' ||
      request.user.role === 'SUPERVISOR';
    return isPrivileged && body?.userId
      ? body.userId
      : request.user.id;
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendancesService.findAll(
      userId,
      from,
      to,
    );
  }

  @Get('mine')
  findMine(
    @Req() request: AuthRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendancesService.findAll(
      request.user.id,
      from,
      to,
    );
  }

  @Get('mine/open')
  findOpen(
    @Req() request: AuthRequest,
  ) {
    return this.attendancesService.findOpenForUser(
      request.user.id,
    );
  }
}
