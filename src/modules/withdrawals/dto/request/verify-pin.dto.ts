// src/modules/withdrawals/dto/request/verify-pin.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyPinDto {
  @ApiProperty({ description: 'ID du retrait', example: 'WTH-20260515-ABC123' })
  @IsString()
  withdrawalId: string;

  @ApiProperty({ description: 'Code PIN à 4 chiffres', example: '1234' })
  @IsString()
  @Length(4, 4)
  pin: string;
}