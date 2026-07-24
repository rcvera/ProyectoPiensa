import {
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
} from 'class-validator';

export class AnswerWorkloadSurveyDto {

  @IsInt()
  @Min(1)
  @Max(5)
  hoursFeeling!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  physicalLoad!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  emotionalLoad!: number;

  @IsString()
  @IsOptional()
  comments?: string;
}
