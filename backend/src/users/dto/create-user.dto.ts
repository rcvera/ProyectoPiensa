import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional
} from 'class-validator';

export class CreateUserDto {

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  position?: string;
}