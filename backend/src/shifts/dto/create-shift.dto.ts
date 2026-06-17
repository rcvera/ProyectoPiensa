import {
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateShiftDto {

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}
