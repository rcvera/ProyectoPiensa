import {
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';

import { IncidentStatus } from '@prisma/client';

export class RespondIncidentDto {

  @IsEnum(IncidentStatus)
  status!: IncidentStatus;

  @IsString()
  @IsOptional()
  adminResponse?: string;
}
