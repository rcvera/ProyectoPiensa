import {
  Controller,
  Get,
} from '@nestjs/common';

import { OvertimesService } from './overtimes.service';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('overtimes')
export class OvertimesController {

  constructor(
    private readonly overtimesService:
      OvertimesService,
  ) {}
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.overtimesService.findAll();
  }
}