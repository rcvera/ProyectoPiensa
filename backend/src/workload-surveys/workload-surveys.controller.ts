import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { WorkloadSurveysService } from './workload-surveys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequest } from '../auth/types/auth-request.type';

@UseGuards(JwtAuthGuard)
@Controller('workload-surveys')
export class WorkloadSurveysController {
  constructor(private readonly service: WorkloadSurveysService) {}

  @Get('mine/pending')
  getPending(@Req() req: AuthRequest) {
    return this.service.getPending(req.user.id);
  }

  @Patch(':id/respond')
  respond(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body()
    body: {
      hoursFeeling: number;
      physicalLoad: number;
      emotionalLoad: number;
      comments?: string;
    },
  ) {
    return this.service.respond(id, req.user.id, body);
  }

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
