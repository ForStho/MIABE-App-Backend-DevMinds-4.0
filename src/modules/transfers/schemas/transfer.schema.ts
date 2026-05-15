// src/modules/transfers/schemas/transfer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TransferDocument = Transfer & Document;

@Schema({ timestamps: true })
export class Transfer {
  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Beneficiary' })
  beneficiaryId: string;

  @Prop({ required: true })
  beneficiaryName: string;

  @Prop({ required: true })
  beneficiaryPhone: string;

  @Prop({ enum: ['france-to-benin', 'benin-to-france'], required: true })
  direction: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Number })
  fee: number;

  @Prop({ required: true, type: Number })
  total: number;

  @Prop({ required: true, type: Number })
  exchangeRate: number;

  @Prop({ required: true, type: Number })
  recipientAmount: number;

  @Prop()
  stellarTransactionHash: string;

  @Prop({
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop([
    {
      step: String,
      status: { type: String, enum: ['done', 'waiting', 'pending'] },
      timestamp: Date,
    },
  ])
  timeline: Array<{ step: string; status: string; timestamp: Date }>;
}

export const TransferSchema = SchemaFactory.createForClass(Transfer);

// TransferSchema.index({ transactionId: 1 }, { unique: true });
TransferSchema.index({ senderId: 1, createdAt: -1 });
TransferSchema.index({ senderId: 1, status: 1 });
TransferSchema.index({ direction: 1 });
TransferSchema.index({ beneficiaryName: 'text', transactionId: 'text' });