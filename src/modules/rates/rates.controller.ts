// src/modules/rates/rates.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RatesService } from './rates.service';
import { Public } from '../../common/decorators/public.decorator';
import { ApiSuccessResponse, ApiErrorResponses } from '../../common/decorators/api-response.decorator';

@ApiTags('Rates')
@Controller('api/rates')
@ApiErrorResponses()
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Public()
  @Get('current')
  @ApiOperation({ summary: 'Taux de change actuel EUR/XOF' })
  @ApiSuccessResponse('Taux de change récupéré avec succès')
  async getCurrentRate() {
    const data = await this.ratesService.getCurrentRate();
    return {
      success: true,
      data,
      message: 'Taux de change récupéré avec succès',
    };
  }

  @Public()
  @Get('history')
  @ApiOperation({ summary: 'Historique des taux (7 derniers jours)' })
  @ApiSuccessResponse('Historique des taux récupéré avec succès')
  async getRateHistory() {
    const data = await this.ratesService.getRateHistory();
    return {
      success: true,
      data,
      message: 'Historique des taux récupéré avec succès',
    };
  }
}