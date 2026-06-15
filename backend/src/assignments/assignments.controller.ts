import {
  Controller,
  Post,
  Get,
  Body,
} from '@nestjs/common';

import { AssignmentsService } from './assignments.service';

import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('assignments')
export class AssignmentsController {

  constructor(
    private readonly assignmentsService:
      AssignmentsService,
  ) {}
  @Roles('ADMIN')
  @Post()
  create(
    @Body()
    dto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.assignmentsService.findAll();
  }
}