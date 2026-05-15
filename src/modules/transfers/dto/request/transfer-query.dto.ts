// src/modules/transfers/dto/request/transfer-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'processing', 'completed', 'failed'] })
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  status?: string;

  @ApiPropertyOptional({ enum: ['france-to-benin', 'benin-to-france'] })
  @IsOptional()
  @IsEnum(['france-to-benin', 'benin-to-france'])
  direction?: string;

  @ApiPropertyOptional({ description: 'Date de début (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Date de fin (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Recherche par nom de bénéficiaire ou ID transaction' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Numéro de page', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Nombre d\'éléments par page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}