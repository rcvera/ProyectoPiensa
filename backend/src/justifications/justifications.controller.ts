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

import { JustificationsService } from './justifications.service';

import { CreateJustificationDto } from './dto/create-justification.dto';
import { RespondJustificationDto } from './dto/respond-justification.dto';
import { FilterJustificationsDto } from './dto/filter-justifications.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequest } from '../auth/types/auth-request.type';

@Controller('justifications')
export class JustificationsController {

  constructor(
    private readonly justificationsService:
      JustificationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: './uploads/justifications',
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
        const allowed =
          file.mimetype.startsWith('image/')
          || file.mimetype === 'application/pdf';
        if (!allowed) {
          return cb(
            new Error('Solo se permiten imágenes o PDF'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Req() request: AuthRequest,
    @Body() dto: CreateJustificationDto,
    @UploadedFile() document?: Express.Multer.File,
  ) {

    if (!dto.date || !dto.type || !dto.description) {
      throw new BadRequestException(
        'Faltan datos de la justificación',
      );
    }

    const documentUrl =
      document
        ? `/uploads/justifications/${document.filename}`
        : null;

    return this.justificationsService.create(
      request.user.id,
      dto,
      documentUrl,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  @Get()
  findAll(
    @Query() filters: FilterJustificationsDto,
  ) {
    return this.justificationsService.findAll(
      filters,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(
    @Req() request: AuthRequest,
  ) {
    return this.justificationsService.findMine(
      request.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthRequest,
  ) {
    return this.justificationsService.findOne(
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
    @Body() dto: RespondJustificationDto,
    @Req() request: AuthRequest,
  ) {
    return this.justificationsService.respond(
      id,
      request.user.id,
      dto,
    );
  }
}
