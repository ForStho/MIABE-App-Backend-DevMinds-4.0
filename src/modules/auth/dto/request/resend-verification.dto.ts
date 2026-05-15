// src/modules/auth/dto/request/resend-verification.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ description: 'Adresse email', example: 'jean.dupont@email.com' })
  @IsEmail()
  email: string;
}