// src/modules/users/dto/response/user-wallet.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserWalletDto {
  @ApiProperty({ description: 'Adresse publique Stellar' })
  publicKey: string;

  @ApiProperty({ description: 'Solde XLM' })
  xlmBalance: string;

  @ApiPropertyOptional({ description: 'Solde EUR sur Stellar' })
  eurBalance?: string;

  @ApiPropertyOptional({ description: 'Solde XOF sur Stellar' })
  xofBalance?: string;

  @ApiProperty({ description: 'Réseau Stellar utilisé' })
  network: string;
}