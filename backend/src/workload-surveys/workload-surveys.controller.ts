import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { WorkloadSurveysService } from './workload-surveys.service';
import { AnswerWorkloadSurveyDto } from './dto/answer-workload-survey.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequest } from '../auth/types/auth-request.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workload-surveys')
export class WorkloadSurveysController {
  constructor(private readonly service: WorkloadSurveysService) {}

  @Roles('ADMIN')
  @Get()
  findAll(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.service.findAll(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get('mine')
  findMine(@Req() req: AuthRequest) {
    return this.service.findMine(req.user.id);
  }

  @Patch(':id')
  answer(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: AnswerWorkloadSurveyDto,
  ) {
    return this.service.answer(id, req.user.id, dto);
  }
}
