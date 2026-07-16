import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AssignmentsService } from './assignments.service';

import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/types/auth-request.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {

  constructor(
    private readonly assignmentsService:
      AssignmentsService,
  ) {}

  @Roles('ADMIN')
  @Post()
  upsert(
    @Body()
    dto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.upsert(dto);
  }

  @Get()
  findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.assignmentsService.findAll(
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
    return this.assignmentsService.findMine(
      request.user.id,
      from,
      to,
    );
  }

  @Roles('ADMIN')
  @Post('publish')
  publish(
    @Body()
    body: { from: string; to: string },
  ) {
    return this.assignmentsService.publishWeek(
      body.from,
      body.to,
    );
  }

  @Roles('ADMIN')
  @Post('fill-week')
  fillWeek(
    @Body()
    body: {
      shiftId: string;
      from: string;
      to: string;
      userIds?: string[];
      isoDays?: number[];
    },
  ) {
    return this.assignmentsService.fillWeek(
      body.shiftId,
      body.from,
      body.to,
      body.userIds,
      body.isoDays,
    );
  }

  @Roles('ADMIN')
  @Post('clear-week')
  clearWeek(
    @Body()
    body: { from: string; to: string; userIds?: string[] },
  ) {
    return this.assignmentsService.clearWeek(
      body.from,
      body.to,
      body.userIds,
    );
  }

  @Roles('ADMIN')
  @Post('copy-week')
  copyWeek(
    @Body()
    body: { from: string; to: string },
  ) {
    return this.assignmentsService.copyWeek(
      body.from,
      body.to,
    );
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.assignmentsService.remove(id);
  }
}
