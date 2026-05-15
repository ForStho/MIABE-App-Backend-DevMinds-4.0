// src/modules/auth/dto/request/verify-email.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({ description: 'Adresse email', example: 'jean.dupont@email.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Code OTP à 6 chiffres', example: '123456' })
    @IsString()
    @Length(6, 6)
    code: string;
}