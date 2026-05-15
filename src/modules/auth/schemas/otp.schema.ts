// src/modules/auth/schemas/otp.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    code: string;

    @Prop({
        enum: ['email-verification', 'password-reset', 'withdrawal'],
        required: true
    })
    type: string;

    @Prop({ default: false })
    used: boolean;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: 0 })
    attempts: number;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// TTL index pour nettoyage automatique après 1 heure
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ userId: 1, type: 1 });