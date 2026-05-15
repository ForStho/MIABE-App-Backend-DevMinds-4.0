// src/modules/rates/dto/response/exchange-rate.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CurrentRateDto {
  @ApiProperty({ description: 'Paire de devises', example: 'EUR/XOF' })
  pair: string;

  @ApiProperty({ description: 'Taux de change', example: 655.96 })
  rate: number;

  @ApiProperty({ description: 'Source du taux', example: 'stellar' })
  source: string;

  @ApiProperty({ description: 'Horodatage de la dernière mise à jour' })
  timestamp: Date;
}

export class RateHistoryDto {
  @ApiProperty({ description: 'Paire de devises' })
  pair: string;

  @ApiProperty({ description: 'Taux de change' })
  rate: number;

  @ApiProperty({ description: 'Source du taux' })
  source: string;

  @ApiProperty({ description: 'Date de validité début' })
  validFrom: Date;

  @ApiProperty({ description: 'Date de validité fin' })
  validUntil: Date;
}