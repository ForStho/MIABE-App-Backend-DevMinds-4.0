// src/modules/users/dto/response/user-profile.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ description: 'ID de l\'utilisateur' })
  _id: string;

  @ApiProperty({ description: 'Prénom' })
  firstName: string;

  @ApiProperty({ description: 'Nom' })
  lastName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Téléphone' })
  phone: string;

  @ApiProperty({ enum: ['France', 'Bénin'] })
  country: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiProperty({ enum: ['none', 'basic', 'full'] })
  kycLevel: string;

  @ApiProperty({ description: 'Adresse wallet Stellar' })
  walletAddress: string;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  lastLogin?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}