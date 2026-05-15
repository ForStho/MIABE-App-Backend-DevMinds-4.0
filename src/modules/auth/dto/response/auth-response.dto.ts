// src/modules/auth/dto/response/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phone: string;

    @ApiProperty({ enum: ['France', 'Bénin'] })
    country: string;

    @ApiProperty()
    city?: string;

    @ApiProperty({ enum: ['none', 'basic', 'full'] })
    kycLevel: string;

    @ApiProperty()
    walletAddress: string;

    @ApiProperty()
    isEmailVerified: boolean;

    @ApiProperty()
    createdAt: Date;
}

export class AuthTokensDto {
    @ApiProperty({ description: 'Token d\'accès JWT' })
    accessToken: string;

    @ApiProperty({ description: 'Token de rafraîchissement JWT' })
    refreshToken: string;
}

export class AuthResponseDto {
    @ApiProperty()
    user: AuthUserDto;

    @ApiProperty()
    tokens: AuthTokensDto;
}

export class MessageResponseDto {
    @ApiProperty()
    message: string;
}