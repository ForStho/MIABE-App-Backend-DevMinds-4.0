// src/modules/notifications/notifications.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationResponseDto, UnreadCountDto } from './dto/response';
import { plainToClass } from 'class-transformer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Liste toutes les notifications de l'utilisateur
   */
  async findAll(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return notifications.map((n) =>
      plainToClass(NotificationResponseDto, n),
    );
  }

  /**
   * Nombre de notifications non lues
   */
  async getUnreadCount(userId: string): Promise<UnreadCountDto> {
    const count = await this.notificationModel.countDocuments({
      userId,
      read: false,
    });

    return { count };
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationModel.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    if (notification.userId.toString() !== userId) {
      throw new ForbiddenException('Cette notification ne vous appartient pas');
    }

    notification.read = true;
    await notification.save();

    return plainToClass(NotificationResponseDto, notification.toObject());
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<{ message: string }> {
    await this.notificationModel.updateMany(
      { userId, read: false },
      { $set: { read: true } },
    );

    return { message: 'Toutes les notifications ont été marquées comme lues' };
  }

  /**
   * Créer une notification (utilisé par les autres modules)
   */
  async createNotification(
    userId: string,
    type: 'transfer' | 'withdrawal' | 'promo' | 'system' | 'kyc',
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    await this.notificationModel.create({
      userId,
      type,
      title,
      message,
      data,
    });

    this.logger.log(`Notification créée pour ${userId}: ${title}`);
  }

  /**
   * Créer une notification de transfert
   */
  async notifyTransfer(
    userId: string,
    transactionId: string,
    amount: number,
    beneficiaryName: string,
    status: string,
  ): Promise<void> {
    const title = status === 'completed' ? 'Transfert réussi' : 'Transfert initié';
    const message =
      status === 'completed'
        ? `Votre transfert de ${amount.toFixed(2)}€ vers ${beneficiaryName} a été effectué avec succès.`
        : `Votre transfert de ${amount.toFixed(2)}€ vers ${beneficiaryName} est en cours de traitement.`;

    await this.createNotification(userId, 'transfer', title, message, {
      transactionId,
      amount,
      beneficiaryName,
      status,
    });
  }

  /**
   * Créer une notification de retrait
   */
  async notifyWithdrawal(
    userId: string,
    withdrawalId: string,
    amount: number,
    method: string,
    status: string,
  ): Promise<void> {
    const methodLabel = method === 'mtn' ? 'MTN Mobile Money' : method === 'moov' ? 'Moov Africa' : 'Virement SEPA';
    const title = status === 'completed' ? 'Retrait effectué' : 'Retrait initié';
    const message =
      status === 'completed'
        ? `Votre retrait de ${amount.toFixed(2)} sur ${methodLabel} a été effectué avec succès.`
        : `Votre retrait de ${amount.toFixed(2)} sur ${methodLabel} est en cours de traitement.`;

    await this.createNotification(userId, 'withdrawal', title, message, {
      withdrawalId,
      amount,
      method,
      status,
    });
  }

  /**
   * Créer une notification KYC
   */
  async notifyKyc(
    userId: string,
    kycLevel: string,
    status: string,
  ): Promise<void> {
    const title = 'Vérification KYC';
    const message =
      status === 'verified'
        ? `Votre vérification KYC de niveau ${kycLevel} a été validée.`
        : 'Veuillez compléter votre vérification KYC pour augmenter vos limites.';

    await this.createNotification(userId, 'kyc', title, message, {
      kycLevel,
      status,
    });
  }
}