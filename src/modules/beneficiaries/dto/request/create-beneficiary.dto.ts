// src/modules/beneficiaries/dto/request/create-beneficiary.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateBeneficiaryDto {
  @ApiProperty({ description: 'Nom complet du bénéficiaire', example: 'Emmanuel Kanté' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Numéro de téléphone', example: '+22997123456' })
  @IsString()
  phone: string;

  @ApiProperty({ enum: ['France', 'Bénin'], description: 'Pays du bénéficiaire' })
  @IsEnum(['France', 'Bénin'])
  country: string;

  @ApiPropertyOptional({ description: 'Lien avec le bénéficiaire', example: 'Frère' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  relationship?: string;

  @ApiPropertyOptional({ description: 'Marquer comme favori', default: false })
  @IsOptional()
  isFavorite?: boolean;
}