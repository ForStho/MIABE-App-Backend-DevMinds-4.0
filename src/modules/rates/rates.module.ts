// src/modules/rates/rates.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { ExchangeRate, ExchangeRateSchema } from './schemas/exchange-rate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExchangeRate.name, schema: ExchangeRateSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [RatesController],
  providers: [RatesService],
  exports: [RatesService],
})
export class RatesModule {}