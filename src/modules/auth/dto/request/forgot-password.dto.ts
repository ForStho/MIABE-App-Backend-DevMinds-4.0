// src/modules/auth/dto/request/forgot-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Adresse email', example: 'jean.dupont@email.com' })
  @IsEmail()
  email: string;
}