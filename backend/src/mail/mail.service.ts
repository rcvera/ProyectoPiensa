import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendWelcome(name: string, email: string, password: string) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: process.env.MAIL_FROM_NAME ?? 'AutoWash Control',
            email: process.env.MAIL_FROM_EMAIL ?? 'noreply@autowash.com',
          },
          to: [{ email, name }],
          subject: 'Bienvenido a AutoWash — Tus credenciales de acceso',
          htmlContent: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f9f9f9;border-radius:10px;overflow:hidden">
              <div style="background:#1677ff;padding:28px 32px">
                <h1 style="color:#fff;margin:0;font-size:22px">AutoWash Control</h1>
                <p style="color:#cfe2ff;margin:6px 0 0">Sistema de Gestión de Turnos</p>
              </div>
              <div style="padding:32px">
                <p style="font-size:16px;color:#333">Hola, <strong>${name}</strong></p>
                <p style="color:#555">Tu cuenta ha sido creada. Estas son tus credenciales de acceso:</p>
                <div style="background:#f0f5ff;border:1px solid #adc6ff;border-radius:8px;padding:20px;margin:20px 0">
                  <p style="margin:0 0 8px"><strong>Correo:</strong> ${email}</p>
                  <p style="margin:0"><strong>Contraseña temporal:</strong>
                    <span style="font-size:18px;font-weight:bold;color:#1677ff;letter-spacing:2px">${password}</span>
                  </p>
                </div>
                <p style="color:#e00;font-size:13px">⚠️ Por seguridad, cambia tu contraseña después de iniciar sesión por primera vez desde el menú de usuario.</p>
              </div>
              <div style="background:#f0f0f0;padding:14px 32px;font-size:12px;color:#999;text-align:center">
                © 2026 AutoWash Control — No respondas a este correo
              </div>
            </div>
          `,
        }),
      });

      const data = await res.json() as any;

      if (!res.ok) {
        throw new Error(data?.message ?? `HTTP ${res.status}`);
      }

      this.logger.log(`Credenciales enviadas a ${email} (messageId: ${data.messageId})`);
    } catch (err: any) {
      this.logger.error(`Error enviando correo a ${email}: ${err.message}`);
      this.logger.warn('========================================');
      this.logger.warn(`  CREDENCIALES (correo falló)`);
      this.logger.warn(`  Empleado  : ${name}`);
      this.logger.warn(`  Correo    : ${email}`);
      this.logger.warn(`  Contraseña: ${password}`);
      this.logger.warn('========================================');
    }
  }
}
