// src/modules/auth/services/auth.service.ts
import {
    Injectable,
    BadRequestException,
    ConflictException,
    UnauthorizedException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { HashUtil } from '../../../common/utils/hash.util';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import { StellarService } from './stellar.service';
import { AuthResponseDto, AuthUserDto } from '../dto/response/auth-response.dto';
import {
    SignupStep1Dto,
    SignupStep2Dto,
    SignupStep3Dto,
    SigninDto,
    VerifyEmailDto,
    ForgotPasswordDto,
    ResetPasswordDto,
} from '../dto/request';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly tokenService: TokenService,
        private readonly otpService: OtpService,
        private readonly emailService: EmailService,
        private readonly stellarService: StellarService,
    ) { }

    /**
     * Inscription complète (toutes les étapes en une fois)
     */

    async signup(
        step1: SignupStep1Dto,
        step2: SignupStep2Dto,
        step3: SignupStep3Dto,
    ): Promise<{ message: string }> {
        const { firstName, lastName, country, city } = step1;
        const { email, phone } = step2;
        const { password, confirmPassword } = step3;

        // Vérifications
        if (password !== confirmPassword) {
            throw new BadRequestException('Les mots de passe ne correspondent pas');
        }

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Cet email est déjà utilisé');
        }

        // Générer le wallet Stellar
        const { publicKey, secretKey } = this.stellarService.generateKeypair();
        const hashedPassword = await HashUtil.hash(password);

        // Créer l'utilisateur
        const user = await this.userModel.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            phone,
            country,
            city,
            password: hashedPassword,
            walletAddress: publicKey,
            walletSecret: secretKey,
            isEmailVerified: false,
            kycLevel: 'none',
        });

        // Créer l'OTP
        const otpCode = await this.otpService.createOtp(user._id.toString(), email, 'email-verification');

        // Envoyer les emails de manière asynchrone (fire and forget)
        this.emailService.sendVerificationEmail(email, otpCode, firstName).catch((err) => {
            this.logger.error(`Erreur envoi email vérification: ${err.message}`);
        });

        this.emailService.sendWelcomeEmail(email, firstName).catch((err) => {
            this.logger.error(`Erreur envoi email bienvenue: ${err.message}`);
        });

        // Activer le compte Stellar (testnet) - aussi en async
        const network = process.env.STELLAR_NETWORK || 'testnet';
        if (network === 'testnet') {
            this.stellarService.fundAccount(publicKey).catch((err) => {
                this.logger.warn(`Impossible d'activer le compte Stellar: ${err.message}`);
            });
        }

        return { message: 'Compte créé avec succès. Vérifiez votre email pour le code OTP.' };
    }

    /**
     * Connexion
     */
    async signin(signinDto: SigninDto, ip: string, userAgent: string): Promise<AuthResponseDto> {
        const { email, password } = signinDto;

        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Compte désactivé');
        }

        const isPasswordValid = await HashUtil.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        // Mettre à jour la date de dernière connexion
        user.lastLogin = new Date();
        await user.save();

        // Générer les tokens
        const payload = { sub: user._id.toString(), email: user.email };
        const tokens = this.tokenService.generateTokenPair(payload);

        // Sauvegarder le refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        // Envoyer l'alerte de connexion de manière asynchrone
        this.emailService.sendLoginAlertEmail(user.email, user.firstName, ip, userAgent).catch((err) => {
            this.logger.error(`Erreur envoi alerte connexion: ${err.message}`);
        });

        const authUser = plainToClass(AuthUserDto, user.toObject());

        return {
            user: authUser,
            tokens,
        };
    }

    /**
     * Vérification email avec OTP
     */
    async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
        const { email, code } = verifyEmailDto;

        const otp = await this.otpService.verifyOtp(email, code, 'email-verification');

        const user = await this.userModel.findById(otp.userId);
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        user.isEmailVerified = true;
        await user.save();

        return { message: 'Email vérifié avec succès' };
    }

    /**
     * Renvoyer le code OTP
     */
    async resendVerification(email: string): Promise<{ message: string }> {
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email déjà vérifié');
        }

        const otpCode = await this.otpService.createOtp(user._id.toString(), email, 'email-verification');
        await this.emailService.sendVerificationEmail(email, otpCode, user.firstName);

        return { message: 'Code de vérification renvoyé' };
    }

    /**
     * Mot de passe oublié
     */
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const { email } = forgotPasswordDto;

        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return { message: 'Si cet email existe, un code de réinitialisation a été envoyé' };
        }

        const otpCode = await this.otpService.createOtp(user._id.toString(), email, 'password-reset');

        // Envoyer l'email de manière asynchrone
        this.emailService.sendPasswordResetEmail(email, otpCode, user.firstName).catch((err) => {
            this.logger.error(`Erreur envoi email reset: ${err.message}`);
        });

        return { message: 'Si cet email existe, un code de réinitialisation a été envoyé' };
    }

    /**
     * Réinitialisation du mot de passe
     */
// src/modules/auth/services/auth.service.ts

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { code, newPassword, confirmNewPassword } = resetPasswordDto;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // On doit d'abord trouver l'OTP par son code pour récupérer l'email
    const otp = await this.otpService.findOtpByCode(code, 'password-reset');

    if (!otp) {
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    // Ensuite vérifier l'OTP avec l'email trouvé
    await this.otpService.verifyOtp(otp.email, code, 'password-reset');

    const user = await this.userModel.findById(otp.userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    user.password = await HashUtil.hash(newPassword);
    user.refreshToken = undefined;
    await user.save();

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

    /**
     * Rafraîchir les tokens
     */
    async refreshToken(refreshToken: string): Promise<{ tokens: { accessToken: string; refreshToken: string } }> {
        const tokens = this.tokenService.refreshTokens(refreshToken);

        // Mettre à jour le refresh token
        const payload = this.tokenService.verifyAccessToken(tokens.accessToken);
        const user = await this.userModel.findById(payload.sub);
        if (user) {
            user.refreshToken = tokens.refreshToken;
            await user.save();
        }

        return { tokens };
    }

    /**
     * Déconnexion
     */
    async logout(userId: string): Promise<{ message: string }> {
        const user = await this.userModel.findById(userId);
        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }

        return { message: 'Déconnexion réussie' };
    }
}