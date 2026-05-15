// src/modules/beneficiaries/beneficiaries.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto/request';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse, ApiErrorResponses } from '../../common/decorators/api-response.decorator';

@ApiTags('Beneficiaries')
@Controller('api/beneficiaries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiErrorResponses()
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des bénéficiaires de l\'utilisateur' })
  @ApiSuccessResponse('Liste des bénéficiaires récupérée')
  async findAll(@CurrentUser('_id') userId: string) {
    const data = await this.beneficiariesService.findAll(userId);
    return {
      success: true,
      data,
      message: 'Bénéficiaires récupérés avec succès',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un bénéficiaire' })
  @ApiSuccessResponse('Bénéficiaire créé')
  async create(
    @CurrentUser('_id') userId: string,
    @Body() createBeneficiaryDto: CreateBeneficiaryDto,
  ) {
    const data = await this.beneficiariesService.create(userId, createBeneficiaryDto);
    return {
      success: true,
      data,
      message: 'Bénéficiaire créé avec succès',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un bénéficiaire' })
  @ApiSuccessResponse('Bénéficiaire récupéré')
  async findOne(
    @CurrentUser('_id') userId: string,
    @Param('id') beneficiaryId: string,
  ) {
    const data = await this.beneficiariesService.findById(userId, beneficiaryId);
    return {
      success: true,
      data,
      message: 'Bénéficiaire récupéré avec succès',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un bénéficiaire' })
  @ApiSuccessResponse('Bénéficiaire modifié')
  async update(
    @CurrentUser('_id') userId: string,
    @Param('id') beneficiaryId: string,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
  ) {
    const data = await this.beneficiariesService.update(
      userId,
      beneficiaryId,
      updateBeneficiaryDto,
    );
    return {
      success: true,
      data,
      message: 'Bénéficiaire modifié avec succès',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un bénéficiaire' })
  @ApiSuccessResponse('Bénéficiaire supprimé')
  async remove(
    @CurrentUser('_id') userId: string,
    @Param('id') beneficiaryId: string,
  ) {
    const data = await this.beneficiariesService.remove(userId, beneficiaryId);
    return {
      success: true,
      data,
      message: 'Bénéficiaire supprimé avec succès',
    };
  }

  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Marquer/démarquer comme favori' })
  @ApiSuccessResponse('Favori basculé')
  async toggleFavorite(
    @CurrentUser('_id') userId: string,
    @Param('id') beneficiaryId: string,
  ) {
    const data = await this.beneficiariesService.toggleFavorite(userId, beneficiaryId);
    const status = data.isFavorite ? 'ajouté aux' : 'retiré des';
    return {
      success: true,
      data,
      message: `Bénéficiaire ${status} favoris`,
    };
  }
}