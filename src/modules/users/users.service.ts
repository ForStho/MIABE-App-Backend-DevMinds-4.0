// src/modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto, ChangePasswordDto } from './dto/request';
import { UserProfileDto, UserStatsDto, UserWalletDto } from './dto/response';
import { HashUtil } from '../../common/utils/hash.util';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UsersService {
  private readonly KYC_LIMITS = {
    none: 500,
    basic: 5000,
    full: Infinity,
  };

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userModel.findById(userId).select('-password -walletSecret -refreshToken');

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return plainToClass(UserProfileDto, user.toObject());
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfileDto> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si le téléphone n'est pas déjà utilisé par un AUTRE utilisateur
    if (updateProfileDto.phone) {
      const existingUser = await this.userModel.findOne({
        phone: updateProfileDto.phone,
        _id: { $ne: userId }, // Exclure l'utilisateur courant
      });
      if (existingUser) {
        throw new ConflictException('Ce numéro de téléphone est déjà utilisé par un autre compte');
      }
    }

    Object.assign(user, updateProfileDto);
    await user.save();

    return plainToClass(UserProfileDto, user.toObject());
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmNewPassword } = changePasswordDto;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const user = await this.userModel.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const isPasswordValid = await HashUtil.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    user.password = await HashUtil.hash(newPassword);
    await user.save();

    return { message: 'Mot de passe modifié avec succès' };
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const monthlyLimit = this.KYC_LIMITS[user.kycLevel];

    return {
      totalSentEUR: 0,
      totalReceivedEUR: 0,
      totalTransfers: 0,
      beneficiariesCount: 0,
      withdrawalsCount: 0,
      monthlyLimit,
      monthlyUsage: 0,
    };
  }

  async getWalletInfo(userId: string): Promise<UserWalletDto> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const walletDto: UserWalletDto = {
      publicKey: user.walletAddress,
      xlmBalance: '0',
      network: process.env.STELLAR_NETWORK || 'testnet',
    };

    return walletDto;
  }
}