// src/modules/auth/dto/request/signup.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
} from 'class-validator';

export class SignupStep1Dto {
  @ApiProperty({ description: 'Prénom', example: 'Jean' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Nom', example: 'Dupont' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ enum: ['France', 'Bénin'], description: 'Pays de résidence' })
  @IsEnum(['France', 'Bénin'])
  country: string;

  @ApiPropertyOptional({ description: 'Ville', example: 'Cotonou' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}

export class SignupStep2Dto {
  @ApiProperty({ description: 'Adresse email', example: 'jean.dupont@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Numéro de téléphone', example: '+22997000000' })
  @IsString()
  phone: string;
}

export class SignupStep3Dto {
  @ApiProperty({
    description: 'Mot de passe (min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial)',
    example: 'P@ssw0rd!'
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, {
    message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial'
  })
  password: string;

  @ApiProperty({ description: 'Confirmation du mot de passe', example: 'P@ssw0rd!' })
  @IsString()
  confirmPassword: string;
}