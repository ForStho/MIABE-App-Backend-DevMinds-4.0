// src/modules/users/interfaces/user.interface.ts
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: 'France' | 'Bénin';
  city?: string;
  kycLevel: 'none' | 'basic' | 'full';
  walletAddress: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserStats {
  totalSentEUR: number;
  totalReceivedEUR: number;
  totalTransfers: number;
  beneficiariesCount: number;
  withdrawalsCount: number;
  monthlyLimit: number;
  monthlyUsage: number;
}