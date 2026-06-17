import {
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateShiftDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
