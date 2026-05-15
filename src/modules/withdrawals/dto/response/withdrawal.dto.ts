// src/modules/withdrawals/dto/response/withdrawal.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WithdrawalResponseDto {
  @ApiProperty({ description: 'ID du retrait' })
  _id: string;

  @ApiProperty({ description: 'ID unique du retrait' })
  withdrawalId: string;

  @ApiProperty({ description: 'ID de l\'utilisateur' })
  userId: string;

  @ApiProperty({ enum: ['france-to-benin', 'benin-to-france'] })
  direction: string;

  @ApiProperty({ description: 'Montant retiré' })
  amount: number;

  @ApiProperty({ enum: ['mtn', 'moov', 'iban'] })
  method: string;

  @ApiProperty({ description: 'Détails de la méthode de retrait' })
  methodDetails: {
    provider: string;
    accountNumber?: string;
    phone?: string;
    iban?: string;
    bankName?: string;
  };

  @ApiProperty({ enum: ['pending', 'processing', 'completed', 'failed'] })
  status: string;

  @ApiProperty({ description: 'Référence unique' })
  reference: string;

  @ApiProperty({ description: 'Frais de retrait' })
  fee: number;

  @ApiProperty({ description: 'Montant total reçu' })
  totalReceived: number;

  @ApiPropertyOptional({ description: 'Date de complétion' })
  completedAt?: Date;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;
}