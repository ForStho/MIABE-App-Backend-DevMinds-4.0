// src/modules/beneficiaries/beneficiaries.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Beneficiary, BeneficiaryDocument } from './schemas/beneficiary.schema';
import { CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto/request';
import { BeneficiaryResponseDto } from './dto/response';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BeneficiariesService {
  private readonly logger = new Logger(BeneficiariesService.name);

  constructor(
    @InjectModel(Beneficiary.name) private beneficiaryModel: Model<BeneficiaryDocument>,
  ) { }

  /**
   * Liste tous les bénéficiaires d'un utilisateur
   */
  async findAll(userId: string): Promise<BeneficiaryResponseDto[]> {
    const beneficiaries = await this.beneficiaryModel
      .find({ userId })
      .sort({ isFavorite: -1, name: 1 });

    return beneficiaries.map((b) => plainToClass(BeneficiaryResponseDto, b.toObject()));
  }

  /**
   * Crée un nouveau bénéficiaire
   */
  async create(
    userId: string,
    createBeneficiaryDto: CreateBeneficiaryDto,
  ): Promise<BeneficiaryResponseDto> {
    // Vérifier si un bénéficiaire avec le même téléphone existe déjà pour cet utilisateur
    const existing = await this.beneficiaryModel.findOne({
      userId,
      phone: createBeneficiaryDto.phone,
    });

    if (existing) {
      throw new ConflictException('Un bénéficiaire avec ce numéro de téléphone existe déjà');
    }

    const beneficiary = await this.beneficiaryModel.create({
      userId,
      ...createBeneficiaryDto,
    });

    this.logger.log(`Bénéficiaire créé: ${beneficiary.name} par l'utilisateur ${userId}`);

    return plainToClass(BeneficiaryResponseDto, beneficiary.toObject());
  }

  /**
   * Récupère un bénéficiaire par son ID
   */
  async findById(userId: string, beneficiaryId: string): Promise<BeneficiaryResponseDto> {
    const beneficiary = await this.beneficiaryModel.findById(beneficiaryId);

    if (!beneficiary) {
      throw new NotFoundException('Bénéficiaire non trouvé');
    }

    if (String(beneficiary.userId) !== String(userId)) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce bénéficiaire');
    }

    return plainToClass(BeneficiaryResponseDto, beneficiary.toObject());
  }

  /**
   * Met à jour un bénéficiaire
   */
  async update(
    userId: string,
    beneficiaryId: string,
    updateBeneficiaryDto: UpdateBeneficiaryDto,
  ): Promise<BeneficiaryResponseDto> {
    const beneficiary = await this.beneficiaryModel.findById(beneficiaryId);

    if (!beneficiary) {
      throw new NotFoundException('Bénéficiaire non trouvé');
    }

    if (beneficiary.userId.toString() !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce bénéficiaire');
    }

    // Vérifier l'unicité du téléphone si modifié
    if (updateBeneficiaryDto.phone && updateBeneficiaryDto.phone !== beneficiary.phone) {
      const existing = await this.beneficiaryModel.findOne({
        userId,
        phone: updateBeneficiaryDto.phone,
        _id: { $ne: beneficiaryId },
      });

      if (existing) {
        throw new ConflictException('Un bénéficiaire avec ce numéro de téléphone existe déjà');
      }
    }

    Object.assign(beneficiary, updateBeneficiaryDto);
    await beneficiary.save();

    this.logger.log(`Bénéficiaire mis à jour: ${beneficiary.name}`);

    return plainToClass(BeneficiaryResponseDto, beneficiary.toObject());
  }

  /**
   * Supprime un bénéficiaire
   */
  async remove(userId: string, beneficiaryId: string): Promise<{ message: string }> {
    const beneficiary = await this.beneficiaryModel.findById(beneficiaryId);

    if (!beneficiary) {
      throw new NotFoundException('Bénéficiaire non trouvé');
    }

    if (beneficiary.userId.toString() !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce bénéficiaire');
    }

    await this.beneficiaryModel.findByIdAndDelete(beneficiaryId);

    this.logger.log(`Bénéficiaire supprimé: ${beneficiary.name}`);

    return { message: 'Bénéficiaire supprimé avec succès' };
  }

  /**
   * Bascule le statut favori d'un bénéficiaire
   */
  async toggleFavorite(
    userId: string,
    beneficiaryId: string,
  ): Promise<BeneficiaryResponseDto> {
    const beneficiary = await this.beneficiaryModel.findById(beneficiaryId);

    if (!beneficiary) {
      throw new NotFoundException('Bénéficiaire non trouvé');
    }

    if (beneficiary.userId.toString() !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce bénéficiaire');
    }

    beneficiary.isFavorite = !beneficiary.isFavorite;
    await beneficiary.save();

    return plainToClass(BeneficiaryResponseDto, beneficiary.toObject());
  }
}