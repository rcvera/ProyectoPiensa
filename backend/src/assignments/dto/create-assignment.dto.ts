import {
  IsString,
} from 'class-validator';

export class CreateAssignmentDto {

  @IsString()
  userId!: string;

  @IsString()
  shiftId!: string;
}