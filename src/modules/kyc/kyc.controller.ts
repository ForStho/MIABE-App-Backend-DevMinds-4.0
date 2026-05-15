// src/modules/kyc/kyc.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { SubmitDocumentsDto } from './dto/request';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiSuccessResponse, ApiErrorResponses } from '../../common/decorators/api-response.decorator';

@ApiTags('KYC')
@Controller('api/kyc')
@ApiErrorResponses()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statut KYC de l\'utilisateur' })
  @ApiSuccessResponse('Statut KYC récupéré avec succès')
  async getStatus(@CurrentUser('_id') userId: string) {
    const data = await this.kycService.getStatus(userId);
    return {
      success: true,
      data,
      message: 'Statut KYC récupéré avec succès',
    };
  }

  @Post('documents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soumettre des documents KYC' })
  @ApiSuccessResponse('Documents soumis avec succès')
  async submitDocuments(
    @CurrentUser('_id') userId: string,
    @Body() submitDocumentsDto: SubmitDocumentsDto,
  ) {
    const data = await this.kycService.submitDocuments(userId, submitDocumentsDto);
    return {
      success: true,
      data,
      message: 'Documents soumis avec succès',
    };
  }

  @Public()
  @Get('levels')
  @ApiOperation({ summary: 'Niveaux KYC et leurs limites' })
  @ApiSuccessResponse('Niveaux KYC récupérés avec succès')
  async getLevels() {
    const data = this.kycService.getLevels();
    return {
      success: true,
      data,
      message: 'Niveaux KYC récupérés avec succès',
    };
  }
}