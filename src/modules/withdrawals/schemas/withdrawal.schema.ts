// src/modules/withdrawals/schemas/withdrawal.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WithdrawalDocument = Withdrawal & Document;

@Schema({ timestamps: true })
export class Withdrawal {
  @Prop({ required: true, unique: true })
  withdrawalId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ enum: ['france-to-benin', 'benin-to-france'], required: true })
  direction: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ enum: ['mtn', 'moov', 'iban'], required: true })
  method: string;

  @Prop({
    type: {
      provider: String,
      accountNumber: String,
      phone: String,
      iban: String,
      bankName: String,
    },
  })
  methodDetails: {
    provider: string;
    accountNumber?: string;
    phone?: string;
    iban?: string;
    bankName?: string;
  };

  @Prop()
  pin: string;

  @Prop({ enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Prop({ required: true, unique: true })
  reference: string;

  @Prop({ required: true, type: Number })
  fee: number;

  @Prop({ required: true, type: Number })
  totalReceived: number;

  @Prop()
  completedAt: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);

// WithdrawalSchema.index({ withdrawalId: 1 }, { unique: true });
WithdrawalSchema.index({ userId: 1, createdAt: -1 });
// WithdrawalSchema.index({ reference: 1 }, { unique: true });
WithdrawalSchema.index({ status: 1 });