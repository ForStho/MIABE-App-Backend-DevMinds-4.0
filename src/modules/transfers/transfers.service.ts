// src/modules/transfers/transfers.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer, TransferDocument } from './schemas/transfer.schema';
import { Beneficiary, BeneficiaryDocument } from '../beneficiaries/schemas/beneficiary.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateTransferDto, TransferQueryDto } from './dto/request';
import { TransferResponseDto } from './dto/response';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);
  private readonly FEE_PERCENTAGE = 0.0075; // 0.75%
  private readonly EXCHANGE_RATE_EUR_XOF = 655.96; // Taux fixe par défaut

  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<TransferDocument>,
    @InjectModel(Beneficiary.name) private beneficiaryModel: Model<BeneficiaryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Génère un ID de transaction unique
   */
  private generateTransactionId(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `DC-${dateStr}-${random}`;
  }

  /**
   * Crée un nouveau transfert
   */
  async create(
    userId: string,
    createTransferDto: CreateTransferDto,
  ): Promise<TransferResponseDto> {
    const { direction, amount, beneficiaryId, beneficiaryName, beneficiaryPhone } =
      createTransferDto;

    let finalBeneficiaryName = beneficiaryName;
    let finalBeneficiaryPhone = beneficiaryPhone;

    // Si un beneficiaryId est fourni, récupérer ses infos
    if (beneficiaryId) {
      const beneficiary = await this.beneficiaryModel.findById(beneficiaryId);

      if (!beneficiary) {
        throw new NotFoundException('Bénéficiaire non trouvé');
      }

      if (beneficiary.userId.toString() !== userId) {
        throw new ForbiddenException('Ce bénéficiaire ne vous appartient pas');
      }

      finalBeneficiaryName = beneficiary.name;
      finalBeneficiaryPhone = beneficiary.phone;
    }

    if (!finalBeneficiaryName || !finalBeneficiaryPhone) {
      throw new BadRequestException(
        'Le nom et le téléphone du bénéficiaire sont requis',
      );
    }

    // Vérifier le niveau KYC et les limites
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Calculer les frais et les montants
    const fee = Number((amount * this.FEE_PERCENTAGE).toFixed(2));
    const total = Number((amount + fee).toFixed(2));
    const exchangeRate = this.EXCHANGE_RATE_EUR_XOF;

    let recipientAmount: number;
    if (direction === 'france-to-benin') {
      // EUR vers XOF
      recipientAmount = Number((amount * exchangeRate).toFixed(0));
    } else {
      // XOF vers EUR
      recipientAmount = Number((amount / exchangeRate).toFixed(2));
    }

    // Générer l'ID de transaction
    const transactionId = this.generateTransactionId();

    // Créer la timeline initiale
    const timeline = [
      {
        step: 'Transfert initié',
        status: 'done',
        timestamp: new Date(),
      },
      {
        step: 'Validation Stellar',
        status: 'pending',
        timestamp: new Date(),
      },
      {
        step: direction === 'france-to-benin' ? 'Conversion EUR → XOF' : 'Conversion XOF → EUR',
        status: 'pending',
        timestamp: new Date(),
      },
      {
        step: direction === 'france-to-benin' ? 'Disponible au Bénin' : 'Disponible en France',
        status: 'waiting',
        timestamp: new Date(),
      },
    ];

    const transfer = await this.transferModel.create({
      transactionId,
      senderId: userId,
      beneficiaryId: beneficiaryId || undefined,
      beneficiaryName: finalBeneficiaryName,
      beneficiaryPhone: finalBeneficiaryPhone,
      direction,
      amount,
      fee,
      total,
      exchangeRate,
      recipientAmount,
      status: 'pending',
      timeline,
    });

    this.logger.log(
      `Transfert créé: ${transactionId} - ${amount} EUR - ${direction}`,
    );

    // Mettre à jour le statut après création (simulation asynchrone)
    this.processTransfer(transfer._id.toString());

    return plainToClass(TransferResponseDto, transfer.toObject());
  }

  /**
   * Simule le traitement du transfert (sera remplacé par l'intégration Stellar réelle)
   */
  private async processTransfer(transferId: string): Promise<void> {
    try {
      const transfer = await this.transferModel.findById(transferId);
      if (!transfer) return;

      // Simuler la validation Stellar
      transfer.timeline[1].status = 'done';
      transfer.timeline[1].timestamp = new Date();
      transfer.status = 'processing';
      await transfer.save();

      // Simuler la conversion
      setTimeout(async () => {
        transfer.timeline[2].status = 'done';
        transfer.timeline[2].timestamp = new Date();
        await transfer.save();
      }, 1000);

      // Simuler la disponibilité
      setTimeout(async () => {
        transfer.timeline[3].status = 'done';
        transfer.timeline[3].timestamp = new Date();
        transfer.status = 'completed';
        await transfer.save();
        this.logger.log(`Transfert complété: ${transfer.transactionId}`);
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erreur traitement transfert ${transferId}: ${message}`);
    }
  }

  /**
   * Historique des transferts avec filtres et pagination
   */
  async findAll(
    userId: string,
    query: TransferQueryDto,
  ): Promise<{
    data: TransferResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const {
      status,
      direction,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = query;

    const filter: Record<string, unknown> = { senderId: userId };

    if (status) {
      filter.status = status;
    }

    if (direction) {
      filter.direction = direction;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
      }
    }

    if (search) {
      filter.$or = [
        { beneficiaryName: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      this.transferModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.transferModel.countDocuments(filter),
    ]);

    return {
      data: transfers.map((t) => plainToClass(TransferResponseDto, t.toObject())),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Détails d'un transfert
   */
  async findById(userId: string, transferId: string): Promise<TransferResponseDto> {
    const transfer = await this.transferModel.findById(transferId);

    if (!transfer) {
      throw new NotFoundException('Transfert non trouvé');
    }

    if (transfer.senderId.toString() !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce transfert');
    }

    return plainToClass(TransferResponseDto, transfer.toObject());
  }

  /**
   * Timeline d'un transfert
   */
  async getTimeline(
    userId: string,
    transferId: string,
  ): Promise<Array<{ step: string; status: string; timestamp: Date }>> {
    const transfer = await this.transferModel.findById(transferId);

    if (!transfer) {
      throw new NotFoundException('Transfert non trouvé');
    }

    if (transfer.senderId.toString() !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce transfert');
    }

    return transfer.timeline;
  }
}