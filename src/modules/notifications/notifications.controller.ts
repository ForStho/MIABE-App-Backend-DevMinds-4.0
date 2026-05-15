// src/modules/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse, ApiErrorResponses } from '../../common/decorators/api-response.decorator';

@ApiTags('Notifications')
@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiErrorResponses()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des notifications' })
  @ApiSuccessResponse('Notifications récupérées avec succès')
  async findAll(@CurrentUser('_id') userId: string) {
    const data = await this.notificationsService.findAll(userId);
    return {
      success: true,
      data,
      message: 'Notifications récupérées avec succès',
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  @ApiSuccessResponse('Compteur récupéré avec succès')
  async getUnreadCount(@CurrentUser('_id') userId: string) {
    const data = await this.notificationsService.getUnreadCount(userId);
    return {
      success: true,
      data,
      message: 'Compteur récupéré avec succès',
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiSuccessResponse('Notification marquée comme lue')
  async markAsRead(
    @CurrentUser('_id') userId: string,
    @Param('id') notificationId: string,
  ) {
    const data = await this.notificationsService.markAsRead(userId, notificationId);
    return {
      success: true,
      data,
      message: 'Notification marquée comme lue',
    };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  @ApiSuccessResponse('Toutes les notifications marquées comme lues')
  async markAllAsRead(@CurrentUser('_id') userId: string) {
    const data = await this.notificationsService.markAllAsRead(userId);
    return {
      success: true,
      data,
      message: 'Toutes les notifications marquées comme lues',
    };
  }
}