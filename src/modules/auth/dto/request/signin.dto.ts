// src/modules/auth/dto/request/signin.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SigninDto {
  @ApiProperty({ description: 'Adresse email', example: 'jean.dupont@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe', example: 'P@ssw0rd!' })
  @IsString()
  password: string;
}