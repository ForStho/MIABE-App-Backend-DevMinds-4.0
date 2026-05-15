// src/modules/beneficiaries/schemas/beneficiary.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BeneficiaryDocument = Beneficiary & Document;

@Schema({ timestamps: true })
export class Beneficiary {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
    userId: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true })
    phone: string;

    @Prop({ enum: ['France', 'Bénin'], required: true })
    country: string;

    @Prop({ trim: true })
    relationship: string;

    @Prop({ default: false })
    isFavorite: boolean;
}

export const BeneficiarySchema = SchemaFactory.createForClass(Beneficiary);

BeneficiarySchema.index({ userId: 1, name: 1 });
BeneficiarySchema.index({ userId: 1, isFavorite: 1 });
BeneficiarySchema.index({ userId: 1, phone: 1 });