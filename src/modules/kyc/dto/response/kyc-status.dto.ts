// src/modules/kyc/dto/response/kyc-status.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KycDocumentStatusDto {
  @ApiProperty({ enum: ['id_card', 'passport', 'proof_of_address', 'selfie'] })
  type: string;

  @ApiProperty({ description: 'URL du document' })
  url: string;

  @ApiProperty({ description: 'Statut de vérification' })
  verified: boolean;
}

export class KycStatusDto {
  @ApiProperty({ enum: ['none', 'basic', 'full'], description: 'Niveau KYC actuel' })
  level: string;

  @ApiProperty({ description: 'Limite mensuelle en EUR' })
  monthlyLimit: number;

  @ApiProperty({ description: 'Statut de vérification email' })
  emailVerified: boolean;

  @ApiProperty({ description: 'Documents soumis' })
  documents: KycDocumentStatusDto[];

  @ApiProperty({ description: 'Progression vers le niveau full (%)' })
  progressPercentage: number;

  @ApiPropertyOptional({ description: 'Prochain niveau KYC possible' })
  nextLevel?: string;

  @ApiPropertyOptional({ description: 'Documents requis pour le prochain niveau' })
  requiredDocuments?: string[];
}