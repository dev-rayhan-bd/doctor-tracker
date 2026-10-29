import { Document } from 'mongoose';

export type UserRole =
  'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'USER' | 'PLAYER' | 'COACH' | 'GUARDIAN' | 'SCOUT';

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
  passwordResetToken?: string | null;
  passwordResetExpiresAt?: Date | null;
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
