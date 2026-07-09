import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.active) {
      throw new UnauthorizedException('Tu cuenta está desactivada. Contactá al administrador.');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.employee?.name ?? user.email,
        email: user.email,
        role: user.role,
      },
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 6 caracteres');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
