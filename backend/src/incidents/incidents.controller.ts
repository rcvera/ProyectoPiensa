import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { IncidentsService } from './incidents.service';

import { CreateIncidentDto } from './dto/create-incident.dto';
import { RespondIncidentDto } from './dto/respond-incident.dto';
import { FilterIncidentsDto } from './dto/filter-incidents.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequest } from '../auth/types/auth-request.type';

@Controller('incidents')
export class IncidentsController {

  constructor(
    private readonly incidentsService:
      IncidentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/incidents',
        filename: (req, file, cb) => {
          const unique =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(
            null,
            `${unique}${extname(file.originalname)}`,
          );
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new Error('Solo imágenes'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Req() request: AuthRequest,
    @Body() dto: CreateIncidentDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {

    if (!dto.type || !dto.description) {
      throw new BadRequestException(
        'Faltan datos del incidente',
      );
    }

    const photoUrl =
      photo
        ? `/uploads/incidents/${photo.filename}`
        : null;

    return this.incidentsService.create(
      request.user.id,
      dto,
      photoUrl,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  @Get()
  findAll(
    @Query() filters: FilterIncidentsDto,
  ) {
    return this.incidentsService.findAll(
      filters,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(
    @Req() request: AuthRequest,
  ) {
    return this.incidentsService.findMine(
      request.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthRequest,
  ) {
    return this.incidentsService.findOne(
      id,
      request.user.id,
      request.user.role,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  @Patch(':id')
  respond(
    @Param('id') id: string,
    @Body() dto: RespondIncidentDto,
    @Req() request: AuthRequest,
  ) {
    return this.incidentsService.respond(
      id,
      request.user.id,
      dto,
    );
  }
}
