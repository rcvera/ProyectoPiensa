import {
  Controller,
  Get,
} from '@nestjs/common';

import { OvertimesService } from './overtimes.service';

@Controller('overtimes')
export class OvertimesController {

  constructor(
    private readonly overtimesService:
      OvertimesService,
  ) {}

  @Get()
  findAll() {
    return this.overtimesService.findAll();
  }
}