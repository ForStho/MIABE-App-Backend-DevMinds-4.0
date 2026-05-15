// src/modules/auth/dto/request/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Code OTP reçu par email', example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial)',
    example: 'NewP@ssw0rd!'
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, {
    message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial'
  })
  newPassword: string;

  @ApiProperty({ description: 'Confirmation du nouveau mot de passe', example: 'NewP@ssw0rd!' })
  @IsString()
  confirmNewPassword: string;
}