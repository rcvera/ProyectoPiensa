import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { AuthRequest } from '../auth/types/auth-request.type';

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(
      createUserDto,
    );
  }

  @Roles('ADMIN', 'SUPERVISOR')
  @Get()
  findAll(
    @Req() req: AuthRequest,
  ) {
    return this.usersService.findAll(req.user.role);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deactivate(
    @Param('id') id: string,
  ) {
    return this.usersService.setActive(
      id,
      false,
    );
  }

  @Roles('ADMIN')
  @Patch(':id/activate')
  activate(
    @Param('id') id: string,
  ) {
    return this.usersService.setActive(
      id,
      true,
    );
  }

  @Roles('ADMIN')
  @Patch(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
  ) {
    return this.usersService.resetPassword(id);
  }
}
