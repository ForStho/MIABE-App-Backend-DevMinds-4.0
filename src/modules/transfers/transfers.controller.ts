// src/modules/transfers/transfers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { CreateTransferDto, TransferQueryDto } from './dto/request';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse, ApiErrorResponses } from '../../common/decorators/api-response.decorator';

@ApiTags('Transfers')
@Controller('api/transfers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiErrorResponses()
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau transfert' })
  @ApiSuccessResponse('Transfert créé avec succès')
  async create(
    @CurrentUser('_id') userId: string,
    @Body() createTransferDto: CreateTransferDto,
  ) {
    const data = await this.transfersService.create(userId, createTransferDto);
    return {
      success: true,
      data,
      message: 'Transfert initié avec succès',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Historique des transferts' })
  @ApiSuccessResponse('Transferts récupérés avec succès')
  async findAll(
    @CurrentUser('_id') userId: string,
    @Query() query: TransferQueryDto,
  ) {
    const { data, pagination } = await this.transfersService.findAll(userId, query);
    return {
      success: true,
      data,
      pagination,
      message: 'Transferts récupérés avec succès',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un transfert' })
  @ApiSuccessResponse('Transfert récupéré avec succès')
  async findOne(
    @CurrentUser('_id') userId: string,
    @Param('id') transferId: string,
  ) {
    const data = await this.transfersService.findById(userId, transferId);
    return {
      success: true,
      data,
      message: 'Transfert récupéré avec succès',
    };
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Timeline d\'un transfert' })
  @ApiSuccessResponse('Timeline récupérée avec succès')
  async getTimeline(
    @CurrentUser('_id') userId: string,
    @Param('id') transferId: string,
  ) {
    const data = await this.transfersService.getTimeline(userId, transferId);
    return {
      success: true,
      data,
      message: 'Timeline récupérée avec succès',
    };
  }
}