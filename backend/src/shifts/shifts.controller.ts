import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { ShiftsService } from './shifts.service';

import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shifts')
export class ShiftsController {

  constructor(
    private readonly shiftsService: ShiftsService,
  ) {}

  @Roles('ADMIN')
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

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shiftsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deactivate(
    @Param('id') id: string,
  ) {
    return this.shiftsService.setActive(
      id,
      false,
    );
  }

  @Roles('ADMIN')
  @Patch(':id/activate')
  activate(
    @Param('id') id: string,
  ) {
    return this.shiftsService.setActive(
      id,
      true,
    );
  }
}
