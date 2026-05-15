// src/modules/users/dto/request/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mot de passe actuel', example: 'CurrentP@ss1' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial)',
    example: 'NewP@ssw0rd'
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, {
    message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial'
  })
  newPassword: string;

  @ApiProperty({ description: 'Confirmation du nouveau mot de passe', example: 'NewP@ssw0rd' })
  @IsString()
  confirmNewPassword: string;
}