import {
  IsEmail,
  IsString,
  IsOptional,
  IsIn,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

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
}
