import {
  IsEnum,
  IsString,
  IsNotEmpty,
} from 'class-validator';

import { IncidentType } from '@prisma/client';

export class CreateIncidentDto {

  @IsEnum(IncidentType)
  type!: IncidentType;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
