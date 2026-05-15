// src/modules/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    toJSON: {
        transform: (doc: unknown, ret: Record<string, any>) => {
            delete ret.password;
            delete ret.walletSecret;
            delete ret.refreshToken;
            return ret;
        }
    }
})
export class User {
    @Prop({ required: true, trim: true })
    firstName: string;

    @Prop({ required: true, trim: true })
    lastName: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    })
    email: string;

    @Prop({ required: true, trim: true })
    phone: string;

    @Prop({ required: true })
    password: string;

    @Prop({ enum: ['France', 'Bénin'], required: true })
    country: string;

    @Prop({ trim: true })
    city: string;

    @Prop({ enum: ['none', 'basic', 'full'], default: 'none' })
    kycLevel: string;

    @Prop([{
        type: { type: String },
        url: String,
        verified: { type: Boolean, default: false }
    }])
    kycDocuments: Array<{ type: string; url: string; verified: boolean }>;

    @Prop({ unique: true, sparse: true })
    walletAddress: string;

    @Prop()
    walletSecret: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop()
    refreshToken?: string;

    @Prop()
    lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);