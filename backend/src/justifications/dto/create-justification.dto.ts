import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

import { JustificationType } from '@prisma/client';

export class CreateJustificationDto {

  @IsDateString()
  date!: string;

  @IsEnum(JustificationType)
  type!: JustificationType;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
