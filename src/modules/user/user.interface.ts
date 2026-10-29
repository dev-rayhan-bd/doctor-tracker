import { Document } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PLAYER' | 'COACH' | 'GUARDIAN' | 'SCOUT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface IUser {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ILoginResponse {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}
