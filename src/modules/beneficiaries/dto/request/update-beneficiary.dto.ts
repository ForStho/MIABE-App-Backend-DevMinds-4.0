// src/modules/beneficiaries/dto/request/update-beneficiary.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class UpdateBeneficiaryDto {
  @ApiPropertyOptional({ description: 'Nom complet du bénéficiaire', example: 'Emmanuel Kanté' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone', example: '+22997123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['France', 'Bénin'], description: 'Pays du bénéficiaire' })
  @IsOptional()
  @IsEnum(['France', 'Bénin'])
  country?: string;

  @ApiPropertyOptional({ description: 'Lien avec le bénéficiaire', example: 'Frère' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  relationship?: string;

  @ApiPropertyOptional({ description: 'Marquer comme favori' })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}