// src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/request';
import { UserProfileDto, UserStatsDto, UserWalletDto } from './dto/response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse, ApiErrorResponses } from '../../common/decorators/api-response.decorator';
import { SuccessResponseDto } from '../../shared/dto/success-response.dto';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiErrorResponses()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur connecté' })
  @ApiSuccessResponse('Profil récupéré avec succès')
  async getProfile(@CurrentUser('_id') userId: string) {
    const data = await this.usersService.getProfile(userId);
    return {
      success: true,
      data,
      message: 'Profil récupéré avec succès',
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Mettre à jour le profil utilisateur' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiSuccessResponse('Profil mis à jour avec succès')
  async updateProfile(
    @CurrentUser('_id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const data = await this.usersService.updateProfile(userId, updateProfileDto);
    return {
      success: true,
      data,
      message: 'Profil mis à jour avec succès',
    };
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiSuccessResponse('Mot de passe modifié avec succès')
  async changePassword(
    @CurrentUser('_id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const data = await this.usersService.changePassword(userId, changePasswordDto);
    return {
      success: true,
      data,
      message: 'Mot de passe modifié avec succès',
    };
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Statistiques de l\'utilisateur connecté' })
  @ApiSuccessResponse('Statistiques récupérées avec succès')
  async getStats(@CurrentUser('_id') userId: string) {
    const data = await this.usersService.getUserStats(userId);
    return {
      success: true,
      data,
      message: 'Statistiques récupérées avec succès',
    };
  }

  @Get('me/wallet')
  @ApiOperation({ summary: 'Informations du wallet Stellar' })
  @ApiSuccessResponse('Wallet récupéré avec succès')
  async getWallet(@CurrentUser('_id') userId: string) {
    const data = await this.usersService.getWalletInfo(userId);
    return {
      success: true,
      data,
      message: 'Wallet récupéré avec succès',
    };
  }
}