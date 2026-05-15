// src/modules/transfers/dto/request/create-transfer.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, Min, IsMongoId } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({
    enum: ['france-to-benin', 'benin-to-france'],
    description: 'Direction du transfert',
    example: 'france-to-benin',
  })
  @IsEnum(['france-to-benin', 'benin-to-france'])
  direction: string;

  @ApiProperty({ description: 'Montant en EUR', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'ID du bénéficiaire enregistré' })
  @IsOptional()
  @IsMongoId()
  beneficiaryId?: string;

  @ApiPropertyOptional({ description: 'Nom du bénéficiaire (si non enregistré)' })
  @IsOptional()
  @IsString()
  beneficiaryName?: string;

  @ApiPropertyOptional({ description: 'Téléphone du bénéficiaire (si non enregistré)' })
  @IsOptional()
  @IsString()
  beneficiaryPhone?: string;
}