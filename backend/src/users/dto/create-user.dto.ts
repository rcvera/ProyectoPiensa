import {
  IsEmail,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  position?: string;
}