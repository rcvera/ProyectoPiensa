import {
  IsEmail,
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(['ADMIN', 'SUPERVISOR', 'EMPLOYEE'])
  role?: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
