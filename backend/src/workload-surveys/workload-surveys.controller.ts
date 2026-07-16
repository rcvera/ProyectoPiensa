import { Controller, Get, UseGuards } from '@nestjs/common';

import { WorkloadSurveysService } from './workload-surveys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workload-surveys')
export class WorkloadSurveysController {
  constructor(private readonly service: WorkloadSurveysService) {}

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
