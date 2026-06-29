import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePositionDto) {
    const exists = await this.prisma.position.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Cargo ya existe');
    }

    return this.prisma.position.create({
      data: { name: dto.name },
    });
  }

  findAll() {
    return this.prisma.position.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, dto: UpdatePositionDto) {
    const pos = await this.prisma.position.findUnique({ where: { id } });

    if (!pos) {
      throw new NotFoundException('Cargo no encontrado');
    }

    if (dto.name && dto.name !== pos.name) {
      const exists = await this.prisma.position.findUnique({
        where: { name: dto.name },
      });
      if (exists) {
        throw new ConflictException('Cargo ya existe');
      }
    }

    return this.prisma.position.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const pos = await this.prisma.position.findUnique({ where: { id } });

    if (!pos) {
      throw new NotFoundException('Cargo no encontrado');
    }

    return this.prisma.position.delete({ where: { id } });
  }
}
