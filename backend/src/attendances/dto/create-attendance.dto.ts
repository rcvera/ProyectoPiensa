import {
  IsString,
} from 'class-validator';

export class CreateAttendanceDto {

  @IsString()
  userId!: string;
}