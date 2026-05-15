// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { CoreModule } from './core/core.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { BeneficiariesModule } from './modules/beneficiaries/beneficiaries.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { RatesModule } from './modules/rates/rates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { KycModule } from './modules/kyc/kyc.module';
import { SharedModule } from './shared/shared.module';
import { JobsModule } from './jobs/jobs.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validationSchema,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    CoreModule,
    CommonModule,
    SharedModule,
    JobsModule,
    AuthModule,
    UsersModule,
    BeneficiariesModule,
    TransfersModule,
    WithdrawalsModule,
    RatesModule,
    NotificationsModule,
    KycModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}