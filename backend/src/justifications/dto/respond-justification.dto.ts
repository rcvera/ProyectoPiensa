import {
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';

import { JustificationStatus } from '@prisma/client';

export class RespondJustificationDto {

  @IsEnum(JustificationStatus)
  status!: JustificationStatus;

  @IsString()
  @IsOptional()
  adminResponse?: string;
}
