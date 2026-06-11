import {
  Controller,
  Post,
  Get,
  Body,
} from '@nestjs/common';

import { ShiftsService } from './shifts.service';

import { CreateShiftDto } from './dto/create-shift.dto';

@Controller('shifts')
export class ShiftsController {

  constructor(
    private readonly shiftsService: ShiftsService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateShiftDto,
  ) {
    return this.shiftsService.create(dto);
  }

  @Get()
  findAll() {
    return this.shiftsService.findAll();
  }
}