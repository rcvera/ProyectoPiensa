import {
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

import {
  IncidentType,
  IncidentStatus,
} from '@prisma/client';

export class FilterIncidentsDto {

  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(IncidentType)
  @IsOptional()
  type?: IncidentType;

  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
