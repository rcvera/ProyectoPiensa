import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PayrollService } from './payroll.service';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequest } from '../auth/types/auth-request.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {

  constructor(private readonly payrollService: PayrollService) {}

  @Roles('ADMIN')
  @Post('generate')
  generateForAll(@Body() dto: GeneratePayrollDto) {
    return this.payrollService.generateForAll(dto.month, dto.year);
  }

  @Roles('ADMIN')
  @Post('generate/:userId')
  generateForUser(
    @Param('userId') userId: string,
    @Body() dto: GeneratePayrollDto,
  ) {
    return this.payrollService.generatePayslip(userId, dto.month, dto.year);
  }

  @Roles('ADMIN')
  @Get()
  findAll(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.payrollService.findAll(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get('mine')
  findMine(
    @Req() req: AuthRequest,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.payrollService.findByUser(
      req.user.id,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }
}
