import {
  IsEmail,
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  IsNumber,
  Min,
  MinLength,
  Matches,
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
  @Matches(/^\d{10}$/, { message: 'La cédula debe tener exactamente 10 dígitos' })
  cedula?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;
}
