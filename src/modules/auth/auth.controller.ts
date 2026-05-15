// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiSuccessResponse, ApiErrorResponses } from '../../common/decorators/api-response.decorator';
import {
  SigninDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto/request';

@ApiTags('Auth')
@Controller('api/auth')
@ApiErrorResponses()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Inscription complète (3 étapes en une requête)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'country',
        'email',
        'phone',
        'password',
        'confirmPassword',
      ],
      properties: {
        firstName: {
          type: 'string',
          example: 'Jean',
          description: 'Prénom',
        },
        lastName: {
          type: 'string',
          example: 'Dupont',
          description: 'Nom',
        },
        country: {
          type: 'string',
          enum: ['France', 'Bénin'],
          example: 'Bénin',
          description: 'Pays de résidence',
        },
        city: {
          type: 'string',
          example: 'Cotonou',
          description: 'Ville (optionnel)',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'jean.dupont@email.com',
          description: 'Adresse email',
        },
        phone: {
          type: 'string',
          example: '+22997000000',
          description: 'Numéro de téléphone',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'P@ssw0rd!',
          description: 'Mot de passe (min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial)',
        },
        confirmPassword: {
          type: 'string',
          format: 'password',
          example: 'P@ssw0rd!',
          description: 'Confirmation du mot de passe',
        },
      },
    },
  })
  @ApiSuccessResponse('Compte créé avec succès')
  async signup(@Body() signupDto: any) {
    const { firstName, lastName, country, city, email, phone, password, confirmPassword } = signupDto;

    const data = await this.authService.signup(
      { firstName, lastName, country, city },
      { email, phone },
      { password, confirmPassword },
    );

    return {
      success: true,
      data,
      message: 'Compte créé avec succès',
    };
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion' })
  @ApiBody({ type: SigninDto })
  @ApiSuccessResponse('Connexion réussie')
  async signin(@Body() signinDto: SigninDto, @Req() req: Request) {
    const ip = (req as any).ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const data = await this.authService.signin(signinDto, ip, userAgent);

    return {
      success: true,
      data,
      message: 'Connexion réussie',
    };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier l\'email avec le code OTP' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiSuccessResponse('Email vérifié avec succès')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const data = await this.authService.verifyEmail(verifyEmailDto);

    return {
      success: true,
      data,
      message: 'Email vérifié avec succès',
    };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renvoyer le code de vérification' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiSuccessResponse('Code renvoyé')
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    const data = await this.authService.resendVerification(resendDto.email);

    return {
      success: true,
      data,
      message: 'Code renvoyé',
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander la réinitialisation du mot de passe' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiSuccessResponse('Email envoyé si le compte existe')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const data = await this.authService.forgotPassword(forgotPasswordDto);

    return {
      success: true,
      data,
      message: 'Email envoyé si le compte existe',
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec le code OTP' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiSuccessResponse('Mot de passe réinitialisé')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const data = await this.authService.resetPassword(resetPasswordDto);

    return {
      success: true,
      data,
      message: 'Mot de passe réinitialisé',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir les tokens JWT' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiSuccessResponse('Tokens rafraîchis')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const data = await this.authService.refreshToken(refreshTokenDto.refreshToken);

    return {
      success: true,
      data,
      message: 'Tokens rafraîchis',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déconnexion' })
  @ApiSuccessResponse('Déconnexion réussie')
  async logout(@CurrentUser('_id') userId: string) {
    const data = await this.authService.logout(userId);

    return {
      success: true,
      data,
      message: 'Déconnexion réussie',
    };
  }
}