// src/modules/rates/schemas/exchange-rate.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExchangeRateDocument = ExchangeRate & Document;

@Schema({ timestamps: true })
export class ExchangeRate {
  @Prop({ required: true })
  pair: string;

  @Prop({ required: true, type: Number })
  rate: number;

  @Prop({ required: true, enum: ['stellar', 'manual', 'fallback'] })
  source: string;

  @Prop({ required: true })
  validFrom: Date;

  @Prop({ required: true })
  validUntil: Date;

  @Prop({ required: true })
  createdAt: Date;
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);

ExchangeRateSchema.index({ pair: 1, createdAt: -1 });
ExchangeRateSchema.index({ pair: 1, validFrom: 1, validUntil: 1 });