import {
  IsString
} from 'class-validator';

export class CreateShiftDto {

  @IsString()
  name!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsString()
  days!: string;
}