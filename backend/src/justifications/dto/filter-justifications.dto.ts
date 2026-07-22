import {
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

import {
  JustificationType,
  JustificationStatus,
} from '@prisma/client';

export class FilterJustificationsDto {

  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(JustificationType)
  @IsOptional()
  type?: JustificationType;

  @IsEnum(JustificationStatus)
  @IsOptional()
  status?: JustificationStatus;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
