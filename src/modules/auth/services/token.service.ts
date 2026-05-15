// src/modules/auth/services/token.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtConfig } from '../../../config/jwt.config';
import { IJwtPayload, ITokenPair } from '../interfaces/auth.interface';

@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name);
    private readonly jwtConfig: JwtConfig;

    constructor(private configService: ConfigService) {
        const config = this.configService.get<JwtConfig>('jwt');
        if (!config) {
            throw new Error('JWT configuration is missing. Check your .env file.');
        }
        this.jwtConfig = config;
    }

    /**
     * Génère une paire de tokens (access + refresh)
     */
    generateTokenPair(payload: IJwtPayload): ITokenPair {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        return { accessToken, refreshToken };
    }

    /**
     * Génère un access token
     */
    private generateAccessToken(payload: IJwtPayload): string {
        const options: jwt.SignOptions = {
            issuer: this.jwtConfig.issuer,
            audience: this.jwtConfig.audience,
            expiresIn: this.jwtConfig.expiresIn as any, // jwt.sign accepte string ou number
        };

        return jwt.sign(payload, this.jwtConfig.secret, options);
    }

    /**
     * Génère un refresh token
     */
    private generateRefreshToken(payload: IJwtPayload): string {
        const options: jwt.SignOptions = {
            issuer: this.jwtConfig.issuer,
            audience: this.jwtConfig.audience,
            expiresIn: this.jwtConfig.refreshExpiresIn as any,
        };

        return jwt.sign(payload, this.jwtConfig.refreshSecret, options);
    }

    /**
     * Vérifie un access token
     */
    verifyAccessToken(token: string): IJwtPayload {
        try {
            return jwt.verify(token, this.jwtConfig.secret, {
                issuer: this.jwtConfig.issuer,
                audience: this.jwtConfig.audience,
            }) as IJwtPayload;
        } catch (error) {
            this.logger.error(`Access token verification failed: ${error.message}`);
            throw new UnauthorizedException('Token invalide ou expiré');
        }
    }

    /**
     * Vérifie un refresh token
     */
    verifyRefreshToken(token: string): IJwtPayload {
        try {
            return jwt.verify(token, this.jwtConfig.refreshSecret, {
                issuer: this.jwtConfig.issuer,
                audience: this.jwtConfig.audience,
            }) as IJwtPayload;
        } catch (error) {
            this.logger.error(`Refresh token verification failed: ${error.message}`);
            throw new UnauthorizedException('Refresh token invalide ou expiré');
        }
    }

    /**
     * Rafraîchit les tokens
     */
    refreshTokens(refreshToken: string): ITokenPair {
        const payload = this.verifyRefreshToken(refreshToken);
        return this.generateTokenPair({
            sub: payload.sub,
            email: payload.email,
        });
    }
}