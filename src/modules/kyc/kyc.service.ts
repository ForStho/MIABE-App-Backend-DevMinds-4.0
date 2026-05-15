// src/modules/kyc/kyc.service.ts
import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SubmitDocumentsDto } from './dto/request';
import { KycStatusDto, KycLevelDto } from './dto/response';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  private readonly KYC_LEVELS: Record<string, {
    monthlyLimit: number;
    requiredDocuments: string[];
    benefits: string[];
  }> = {
    none: {
      monthlyLimit: 500,
      requiredDocuments: ['email_verification'],
      benefits: ['Transferts jusqu\'à 500€/mois'],
    },
    basic: {
      monthlyLimit: 5000,
      requiredDocuments: ['email_verification', 'id_card', 'selfie'],
      benefits: [
        'Transferts jusqu\'à 5000€/mois',
        'Retraits Mobile Money',
        'Retraits SEPA',
      ],
    },
    full: {
      monthlyLimit: Infinity,
      requiredDocuments: ['email_verification', 'id_card', 'passport', 'proof_of_address', 'selfie'],
      benefits: [
        'Transferts illimités',
        'Retraits illimités',
        'Support prioritaire',
        'Taux de change préférentiel',
      ],
    },
  };

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Statut KYC de l'utilisateur
   */
  async getStatus(userId: string): Promise<KycStatusDto> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Pour le MVP : si l'email est vérifié, on passe en basic
    // La vérification complète sera implémentée plus tard
    if (user.isEmailVerified && user.kycLevel === 'none') {
      user.kycLevel = 'basic';
      await user.save();
      this.logger.log(`KYC auto-upgraded to basic for user ${userId}`);

      await this.notificationsService.notifyKyc(userId, 'basic', 'verified');
    }

    const currentLevel = this.KYC_LEVELS[user.kycLevel];
    const documents = user.kycDocuments || [];

    // Calculer la progression vers le niveau full
    const totalRequired = this.KYC_LEVELS.full.requiredDocuments.length;
    let completed = 0;
    if (user.isEmailVerified) completed++;
    documents.forEach((doc) => {
      if (doc.verified) completed++;
    });
    const progressPercentage = Math.round((completed / totalRequired) * 100);

    // Déterminer le prochain niveau
    const levels = ['none', 'basic', 'full'];
    const currentIndex = levels.indexOf(user.kycLevel);
    const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : undefined;

    const requiredDocuments = nextLevel
      ? this.KYC_LEVELS[nextLevel].requiredDocuments.filter(
          (doc) => !this.isDocumentCompleted(user, doc),
        )
      : undefined;

    return {
      level: user.kycLevel,
      monthlyLimit: currentLevel.monthlyLimit,
      emailVerified: user.isEmailVerified,
      documents: documents.map((doc) => ({
        type: doc.type,
        url: doc.url,
        verified: doc.verified,
      })),
      progressPercentage,
      nextLevel,
      requiredDocuments,
    };
  }

  /**
   * Vérifie si un document requis est déjà complété
   */
  private isDocumentCompleted(user: UserDocument, documentType: string): boolean {
    if (documentType === 'email_verification') {
      return user.isEmailVerified;
    }
    return user.kycDocuments.some(
      (doc) => doc.type === documentType && doc.verified,
    );
  }

  /**
   * Soumettre des documents KYC
   */
  async submitDocuments(
    userId: string,
    submitDocumentsDto: SubmitDocumentsDto,
  ): Promise<KycStatusDto> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Ajouter les nouveaux documents
    const existingDocs = user.kycDocuments || [];

    for (const newDoc of submitDocumentsDto.documents) {
      // Remplacer si le type existe déjà
      const existingIndex = existingDocs.findIndex(
        (doc) => doc.type === newDoc.type,
      );

      if (existingIndex >= 0) {
        existingDocs[existingIndex] = {
          type: newDoc.type,
          url: newDoc.url,
          verified: false,
        };
      } else {
        existingDocs.push({
          type: newDoc.type,
          url: newDoc.url,
          verified: false,
        });
      }
    }

    user.kycDocuments = existingDocs;

    // Pour le MVP : auto-vérifier les documents
    // En production, il faudrait une vérification manuelle ou API externe
    const allBasicDocsSubmitted = this.KYC_LEVELS.basic.requiredDocuments.every(
      (docType) => this.isDocumentCompleted(user, docType),
    );

    const allFullDocsSubmitted = this.KYC_LEVELS.full.requiredDocuments.every(
      (docType) => this.isDocumentCompleted(user, docType),
    );

    if (allFullDocsSubmitted) {
      user.kycLevel = 'full';
      this.logger.log(`KYC upgraded to full for user ${userId}`);
      await this.notificationsService.notifyKyc(userId, 'full', 'verified');
    } else if (allBasicDocsSubmitted && user.kycLevel === 'none') {
      user.kycLevel = 'basic';
      this.logger.log(`KYC upgraded to basic for user ${userId}`);
      await this.notificationsService.notifyKyc(userId, 'basic', 'verified');
    }

    await user.save();

    return this.getStatus(userId);
  }

  /**
   * Niveaux KYC disponibles
   */
  getLevels(): KycLevelDto[] {
    return Object.entries(this.KYC_LEVELS).map(([level, details]) => ({
      level,
      monthlyLimit: details.monthlyLimit,
      requiredDocuments: details.requiredDocuments,
      benefits: details.benefits,
    }));
  }
}