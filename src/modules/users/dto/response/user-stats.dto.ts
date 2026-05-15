// src/modules/users/dto/response/user-stats.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ description: 'Total envoyé en EUR' })
  totalSentEUR: number;

  @ApiProperty({ description: 'Total reçu en EUR' })
  totalReceivedEUR: number;

  @ApiProperty({ description: 'Nombre total de transferts' })
  totalTransfers: number;

  @ApiProperty({ description: 'Nombre de bénéficiaires' })
  beneficiariesCount: number;

  @ApiProperty({ description: 'Nombre de retraits effectués' })
  withdrawalsCount: number;

  @ApiProperty({ description: 'Limite mensuelle selon le niveau KYC' })
  monthlyLimit: number;

  @ApiProperty({ description: 'Utilisation mensuelle actuelle' })
  monthlyUsage: number;
}