// src/modules/transfers/dto/response/transfer.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferResponseDto {
  @ApiProperty({ description: 'ID du transfert' })
  _id: string;

  @ApiProperty({ description: 'ID de transaction unique' })
  transactionId: string;

  @ApiProperty({ description: 'ID de l\'expéditeur' })
  senderId: string;

  @ApiPropertyOptional({ description: 'ID du bénéficiaire' })
  beneficiaryId?: string;

  @ApiProperty({ description: 'Nom du bénéficiaire' })
  beneficiaryName: string;

  @ApiProperty({ description: 'Téléphone du bénéficiaire' })
  beneficiaryPhone: string;

  @ApiProperty({ enum: ['france-to-benin', 'benin-to-france'] })
  direction: string;

  @ApiProperty({ description: 'Montant envoyé (EUR)' })
  amount: number;

  @ApiProperty({ description: 'Frais de transfert (EUR)' })
  fee: number;

  @ApiProperty({ description: 'Total débité (EUR)' })
  total: number;

  @ApiProperty({ description: 'Taux de change appliqué' })
  exchangeRate: number;

  @ApiProperty({ description: 'Montant reçu par le bénéficiaire (XOF)' })
  recipientAmount: number;

  @ApiPropertyOptional({ description: 'Hash de la transaction Stellar' })
  stellarTransactionHash?: string;

  @ApiProperty({ enum: ['pending', 'processing', 'completed', 'failed'] })
  status: string;

  @ApiProperty({ description: 'Timeline du transfert' })
  timeline: Array<{ step: string; status: string; timestamp: Date }>;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;
}

export class TransferTimelineDto {
  @ApiProperty({ description: 'Étape du transfert' })
  step: string;

  @ApiProperty({ enum: ['done', 'waiting', 'pending'] })
  status: string;

  @ApiProperty({ description: 'Horodatage' })
  timestamp: Date;
}