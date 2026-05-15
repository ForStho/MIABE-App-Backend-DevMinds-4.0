// src/modules/kyc/dto/response/kyc-level.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class KycLevelDto {
  @ApiProperty({ enum: ['none', 'basic', 'full'], description: 'Nom du niveau' })
  level: string;

  @ApiProperty({ description: 'Limite mensuelle en EUR' })
  monthlyLimit: number;

  @ApiProperty({ description: 'Documents requis' })
  requiredDocuments: string[];

  @ApiProperty({ description: 'Avantages du niveau' })
  benefits: string[];
}