import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    dto: CreateAssignmentDto,
  ) {

    return this.prisma.assignment.create({
      data: {
        userId: dto.userId,
        shiftId: dto.shiftId,
      },
    });
  }

  async findAll() {

    return this.prisma.assignment.findMany({
      include: {
        user: true,
        shift: true,
      },
    });
  }
}