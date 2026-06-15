import {
  Controller,
  Post,
  Get,
  Body,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';

import {
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(
    JwtAuthGuard,
    RolesGuard,
)
@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) {}
@Roles('ADMIN'
    )   
  @Post()
  create(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(
      createUserDto,
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}