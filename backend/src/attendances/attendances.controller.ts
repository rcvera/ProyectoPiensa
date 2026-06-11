import {
  Controller,
  Post,
  Get,
  Body,
} from '@nestjs/common';

import { AttendancesService } from './attendances.service';

@Controller('attendances')
export class AttendancesController {

  constructor(
    private readonly attendancesService:
      AttendancesService,
  ) {}

  @Post('check-in')
  checkIn(
    @Body() body: {
      userId: string;
    },
  ) {
    return this.attendancesService.checkIn(
      body.userId,
    );
  }

  @Post('check-out')
  checkOut(
    @Body() body: {
      userId: string;
    },
  ) {
    return this.attendancesService.checkOut(
      body.userId,
    );
  }

  @Get()
  history() {
    return this.attendancesService.history();
  }
}