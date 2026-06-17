import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request.type';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {

  constructor(
    private readonly notificationsService:
      NotificationsService,
  ) {}

  @Get()
  list(
    @Req() request: AuthRequest,
  ) {
    return this.notificationsService.findForUser(
      request.user.id,
    );
  }

  @Get('unread-count')
  unreadCount(
    @Req() request: AuthRequest,
  ) {
    return this.notificationsService.unreadCount(
      request.user.id,
    );
  }

  @Patch('read-all')
  readAll(
    @Req() request: AuthRequest,
  ) {
    return this.notificationsService.markAllAsRead(
      request.user.id,
    );
  }

  @Patch(':id/read')
  markRead(
    @Param('id') id: string,
    @Req() request: AuthRequest,
  ) {
    return this.notificationsService.markAsRead(
      id,
      request.user.id,
    );
  }
}
