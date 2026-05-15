// src/modules/auth/interfaces/auth.interface.ts
export interface IJwtPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface ITokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface IOtpRequest {
    userId: string;
    email: string;
    type: 'email-verification' | 'password-reset' | 'withdrawal';
}

export interface ISignupStep1 {
    firstName: string;
    lastName: string;
    country: string;
    city?: string;
}

export interface ISignupStep2 {
    email: string;
    phone: string;
}

export interface ISignupStep3 {
    password: string;
    confirmPassword: string;
}