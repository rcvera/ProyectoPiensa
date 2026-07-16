import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OvertimesService } from './overtimes.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/types/auth-request.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('overtimes')
export class OvertimesController {

  constructor(
    private readonly overtimesService: OvertimesService,
  ) {}

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.overtimesService.findAll();
  }

  @Get('mine/summary')
  getWeekSummary(
    @Req() req: AuthRequest,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.overtimesService.getWeekSummary(req.user.id, from, to);
  }
}
