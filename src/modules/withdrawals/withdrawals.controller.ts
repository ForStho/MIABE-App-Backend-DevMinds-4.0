// src/modules/withdrawals/withdrawals.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto, VerifyPinDto } from './dto/request';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse, ApiErrorResponses } from '../../common/decorators/api-response.decorator';

@ApiTags('Withdrawals')
@Controller('api/withdrawals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiErrorResponses()
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un retrait' })
  @ApiSuccessResponse('Retrait créé avec succès')
  async create(
    @CurrentUser('_id') userId: string,
    @Body() createWithdrawalDto: CreateWithdrawalDto,
  ) {
    const data = await this.withdrawalsService.create(userId, createWithdrawalDto);
    return {
      success: true,
      data,
      message: 'Retrait initié avec succès',
    };
  }

  @Post('verify-pin')
  @ApiOperation({ summary: 'Vérifier le PIN Mobile Money' })
  @ApiSuccessResponse('PIN vérifié avec succès')
  async verifyPin(
    @CurrentUser('_id') userId: string,
    @Body() verifyPinDto: VerifyPinDto,
  ) {
    const data = await this.withdrawalsService.verifyPin(userId, verifyPinDto);
    return {
      success: true,
      data,
      message: 'PIN vérifié, retrait en cours de traitement',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Historique des retraits' })
  @ApiSuccessResponse('Retraits récupérés avec succès')
  async findAll(@CurrentUser('_id') userId: string) {
    const data = await this.withdrawalsService.findAll(userId);
    return {
      success: true,
      data,
      message: 'Retraits récupérés avec succès',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un retrait' })
  @ApiSuccessResponse('Retrait récupéré avec succès')
  async findOne(
    @CurrentUser('_id') userId: string,
    @Param('id') withdrawalId: string,
  ) {
    const data = await this.withdrawalsService.findById(userId, withdrawalId);
    return {
      success: true,
      data,
      message: 'Retrait récupéré avec succès',
    };
  }
}