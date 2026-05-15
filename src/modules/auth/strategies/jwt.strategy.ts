// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { JwtConfig } from '../../../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {
        const jwtConfig = configService.get<JwtConfig>('jwt');

        if (!jwtConfig) {
            throw new Error('JWT configuration is missing. Check your .env file.');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfig.secret,
        });
    }

    async validate(payload: any): Promise<UserDocument> {
        const user = await this.userModel.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Utilisateur non trouvé');
        }
        if (!user.isActive) {
            throw new UnauthorizedException('Compte désactivé');
        }
        return user;
    }
}