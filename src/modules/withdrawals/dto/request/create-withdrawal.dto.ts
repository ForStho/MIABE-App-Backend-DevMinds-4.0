// src/modules/withdrawals/dto/request/create-withdrawal.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ enum: ['france-to-benin', 'benin-to-france'], description: 'Direction du retrait' })
  @IsEnum(['france-to-benin', 'benin-to-france'])
  direction: string;

  @ApiProperty({ description: 'Montant à retirer (EUR pour France, XOF pour Bénin)', example: 50000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: ['mtn', 'moov', 'iban'], description: 'Méthode de retrait' })
  @IsEnum(['mtn', 'moov', 'iban'])
  method: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone Mobile Money (obligatoire si MTN ou Moov)', example: '+22997000000' })
  @ValidateIf((o) => o.method === 'mtn' || o.method === 'moov')
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Code PIN Mobile Money à 4 chiffres (obligatoire si MTN ou Moov)', example: '1234' })
  @ValidateIf((o) => o.method === 'mtn' || o.method === 'moov')
  @IsString()
  pin?: string;

  @ApiPropertyOptional({ description: 'IBAN du compte bancaire (obligatoire si IBAN)', example: 'FR7612345678901234567890123' })
  @ValidateIf((o) => o.method === 'iban')
  @IsString()
  iban?: string;

  @ApiPropertyOptional({ description: 'Nom de la banque (obligatoire si IBAN)', example: 'Société Générale' })
  @ValidateIf((o) => o.method === 'iban')
  @IsString()
  bankName?: string;
}