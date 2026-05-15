// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { OtpService } from './services/otp.service';
import { EmailService } from './services/email.service';
import { StellarService } from './services/stellar.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { JwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtConfig>('jwt');
        if (!jwtConfig) {
          throw new Error('JWT configuration is missing');
        }
        // Convertir la string en valeur numérique si c'est un nombre
        const expiresIn = jwtConfig.expiresIn;
        const expiresInValue = /^\d+$/.test(expiresIn) ? parseInt(expiresIn, 10) : expiresIn;
        
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: expiresInValue as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    OtpService,
    EmailService,
    StellarService,
    JwtStrategy,
  ],
  exports: [
    AuthService,
    TokenService,
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthModule {}