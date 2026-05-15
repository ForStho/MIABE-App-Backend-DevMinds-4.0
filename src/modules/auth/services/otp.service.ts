// src/modules/auth/services/otp.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from '../schemas/otp.schema';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly MAX_ATTEMPTS = 5;
  private readonly OTP_EXPIRY_MINUTES = 15;

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}

  /**
   * Génère un code OTP à 6 chiffres
   */
  private generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Crée un nouvel OTP pour un utilisateur
   */
  async createOtp(
    userId: string,
    email: string,
    type: 'email-verification' | 'password-reset' | 'withdrawal',
  ): Promise<string> {
    // Invalider les anciens OTP du même type pour cet utilisateur
    await this.otpModel.updateMany(
      { userId, type, used: false },
      { $set: { used: true } }
    );

    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    await this.otpModel.create({
      userId,
      email,
      code,
      type,
      expiresAt,
      used: false,
      attempts: 0,
    });

    this.logger.log(`OTP créé pour ${email} (type: ${type})`);
    return code;
  }

  /**
   * Vérifie un code OTP
   */
  async verifyOtp(
    email: string,
    code: string,
    type: 'email-verification' | 'password-reset' | 'withdrawal',
  ): Promise<OtpDocument> {
    const otp = await this.otpModel.findOne({
      email,
      type,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    if (otp.attempts >= this.MAX_ATTEMPTS) {
      otp.used = true;
      await otp.save();
      throw new BadRequestException('Trop de tentatives. Veuillez demander un nouveau code');
    }

    if (otp.code !== code) {
      otp.attempts += 1;
      await otp.save();
      throw new BadRequestException('Code OTP incorrect');
    }

    otp.used = true;
    await otp.save();

    return otp;
  }

  // src/modules/auth/services/otp.service.ts

  /**
   * Trouve un OTP par son code (pour le reset password où on n'a pas l'email)
   */
  async findOtpByCode(
    code: string,
    type: 'email-verification' | 'password-reset' | 'withdrawal',
  ): Promise<OtpDocument | null> {
    return this.otpModel.findOne({
      code,
      type,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }
  
}