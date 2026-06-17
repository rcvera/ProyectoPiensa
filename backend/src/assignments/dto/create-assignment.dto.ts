import {
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateAssignmentDto {

  @IsString()
  userId!: string;

  @IsString()
  shiftId!: string;

  @IsDateString()
  date!: string;
}
