import {
  IsEmail,
  IsString,
  IsOptional,
  IsIn,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn(['ADMIN', 'SUPERVISOR', 'EMPLOYEE'])
  role?: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';

  @IsOptional()
  phone?: string;

  @IsOptional()
  position?: string;
}
