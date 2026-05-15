// src/modules/withdrawals/withdrawals.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Withdrawal, WithdrawalDocument } from './schemas/withdrawal.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateWithdrawalDto, VerifyPinDto } from './dto/request';
import { WithdrawalResponseDto } from './dto/response';
import { HashUtil } from '../../common/utils/hash.util';
import { plainToClass } from 'class-transformer';
import * as crypto from 'crypto';

@Injectable()
export class WithdrawalsService {
  private readonly logger = new Logger(WithdrawalsService.name);
  private readonly FEE_PERCENTAGE = 0.01; // 1% de frais

  constructor(
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Génère un ID de retrait unique
   */
  private generateWithdrawalId(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `WTH-${dateStr}-${random}`;
  }

  /**
   * Génère une référence unique
   */
  private generateReference(): string {
    const prefix = 'REF';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Crée un nouveau retrait
   */
  async create(
    userId: string,
    createWithdrawalDto: CreateWithdrawalDto,
  ): Promise<WithdrawalResponseDto> {
    const { direction, amount, method, phone, pin, iban, bankName } =
      createWithdrawalDto;

    // Vérifier l'utilisateur
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier les champs requis selon la méthode
    if ((method === 'mtn' || method === 'moov') && !phone) {
      throw new BadRequestException('Le numéro de téléphone est requis pour Mobile Money');
    }

    if ((method === 'mtn' || method === 'moov') && !pin) {
      throw new BadRequestException('Le code PIN est requis pour Mobile Money');
    }

    if (method === 'iban') {
      if (!iban) {
        throw new BadRequestException('L\'IBAN est requis pour un virement bancaire');
      }
      if (!bankName) {
        throw new BadRequestException('Le nom de la banque est requis pour un virement bancaire');
      }
    }

    // Calculer les frais et le montant reçu
    const fee = Number((amount * this.FEE_PERCENTAGE).toFixed(2));
    const totalReceived = Number((amount - fee).toFixed(2));

    // Construire les détails de la méthode
    const methodDetails: Withdrawal['methodDetails'] = {
      provider: method === 'mtn' ? 'MTN Mobile Money' : method === 'moov' ? 'Moov Africa' : 'Virement SEPA',
    };

    if (method === 'mtn' || method === 'moov') {
      methodDetails.phone = phone;
    }

    if (method === 'iban') {
      methodDetails.iban = iban;
      methodDetails.bankName = bankName;
    }

    // Hasher le PIN si fourni
    let hashedPin: string | undefined;
    if (pin) {
      hashedPin = await HashUtil.hash(pin);
    }

    const withdrawalId = this.generateWithdrawalId();
    const reference = this.generateReference();

    const withdrawal = await this.withdrawalModel.create({
      withdrawalId,
      userId,
      direction,
      amount,
      method,
      methodDetails,
      pin: hashedPin,
      status: method === 'iban' ? 'processing' : 'pending',
      reference,
      fee,
      totalReceived,
    });

    this.logger.log(`Retrait créé: ${withdrawalId} - ${amount} - ${method}`);

    // Pour les retraits IBAN, simuler un traitement
    if (method === 'iban') {
      this.processIbanWithdrawal(withdrawal._id.toString());
    }

    return plainToClass(WithdrawalResponseDto, withdrawal.toObject());
  }

  /**
   * Vérifie le PIN Mobile Money et confirme le retrait
   */
  async verifyPin(
    userId: string,
    verifyPinDto: VerifyPinDto,
  ): Promise<WithdrawalResponseDto> {
    const { withdrawalId, pin } = verifyPinDto;

    const withdrawal = await this.withdrawalModel.findOne({ withdrawalId });

    if (!withdrawal) {
      throw new NotFoundException('Retrait non trouvé');
    }

    if (withdrawal.userId.toString() !== userId) {
      throw new ForbiddenException('Ce retrait ne vous appartient pas');
    }

    if (withdrawal.status !== 'pending') {
      throw new BadRequestException('Ce retrait a déjà été traité');
    }

    if (withdrawal.method === 'iban') {
      throw new BadRequestException('La vérification PIN ne s\'applique pas aux virements bancaires');
    }

    if (!withdrawal.pin) {
      throw new BadRequestException('Aucun PIN associé à ce retrait');
    }

    const isPinValid = await HashUtil.compare(pin, withdrawal.pin);

    if (!isPinValid) {
      throw new BadRequestException('Code PIN incorrect');
    }

    // Confirmer le retrait
    withdrawal.status = 'processing';
    await withdrawal.save();

    // Simuler la complétion
    this.processMobileMoneyWithdrawal(withdrawal._id.toString());

    return plainToClass(WithdrawalResponseDto, withdrawal.toObject());
  }

  /**
   * Simule le traitement d'un retrait Mobile Money
   */
  private async processMobileMoneyWithdrawal(withdrawalMongoId: string): Promise<void> {
    setTimeout(async () => {
      try {
        const withdrawal = await this.withdrawalModel.findById(withdrawalMongoId);
        if (!withdrawal) return;

        withdrawal.status = 'completed';
        withdrawal.completedAt = new Date();
        await withdrawal.save();

        this.logger.log(`Retrait Mobile Money complété: ${withdrawal.withdrawalId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Erreur traitement retrait ${withdrawalMongoId}: ${message}`);
      }
    }, 3000);
  }

  /**
   * Simule le traitement d'un retrait IBAN
   */
  private async processIbanWithdrawal(withdrawalMongoId: string): Promise<void> {
    setTimeout(async () => {
      try {
        const withdrawal = await this.withdrawalModel.findById(withdrawalMongoId);
        if (!withdrawal) return;

        withdrawal.status = 'completed';
        withdrawal.completedAt = new Date();
        await withdrawal.save();

        this.logger.log(`Virement SEPA complété: ${withdrawal.withdrawalId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Erreur traitement virement ${withdrawalMongoId}: ${message}`);
      }
    }, 5000);
  }

  /**
   * Historique des retraits
   */
  async findAll(userId: string): Promise<WithdrawalResponseDto[]> {
    const withdrawals = await this.withdrawalModel
      .find({ userId })
      .sort({ createdAt: -1 });

    return withdrawals.map((w) =>
      plainToClass(WithdrawalResponseDto, w.toObject()),
    );
  }

  /**
   * Détails d'un retrait
   */
  async findById(
    userId: string,
    withdrawalId: string,
  ): Promise<WithdrawalResponseDto> {
    const withdrawal = await this.withdrawalModel
      .findOne({ withdrawalId })
      .orFail()
      .catch(() => {
        throw new NotFoundException('Retrait non trouvé');
      });

    if (withdrawal.userId.toString() !== userId) {
      throw new ForbiddenException('Ce retrait ne vous appartient pas');
    }

    return plainToClass(WithdrawalResponseDto, withdrawal.toObject());
  }
}