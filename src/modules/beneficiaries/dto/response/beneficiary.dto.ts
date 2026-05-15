// src/modules/beneficiaries/dto/response/beneficiary.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BeneficiaryResponseDto {
  @ApiProperty({ description: 'ID du bénéficiaire' })
  _id: string;

  @ApiProperty({ description: 'ID de l\'utilisateur propriétaire' })
  userId: string;

  @ApiProperty({ description: 'Nom complet' })
  name: string;

  @ApiProperty({ description: 'Numéro de téléphone' })
  phone: string;

  @ApiProperty({ enum: ['France', 'Bénin'] })
  country: string;

  @ApiPropertyOptional({ description: 'Lien de parenté' })
  relationship?: string;

  @ApiProperty({ description: 'Est un favori' })
  isFavorite: boolean;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;
}