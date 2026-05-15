// src/modules/notifications/dto/response/notification.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({ description: 'ID de la notification' })
  _id: string;

  @ApiProperty({ description: 'ID de l\'utilisateur' })
  userId: string;

  @ApiProperty({ enum: ['transfer', 'withdrawal', 'promo', 'system', 'kyc'] })
  type: string;

  @ApiProperty({ description: 'Titre de la notification' })
  title: string;

  @ApiProperty({ description: 'Message de la notification' })
  message: string;

  @ApiProperty({ description: 'Statut de lecture' })
  read: boolean;

  @ApiPropertyOptional({ description: 'Données additionnelles' })
  data?: Record<string, unknown>;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;
}

export class UnreadCountDto {
  @ApiProperty({ description: 'Nombre de notifications non lues' })
  count: number;
}