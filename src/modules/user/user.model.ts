import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from './user.interface';
import { env } from '@/config/env';

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'PLAYER', 'COACH', 'GUARDIAN', 'SCOUT'],
      default: 'PLAYER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
      default: 'ACTIVE',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.otp;
        delete ret.otpExpiresAt;
        return ret;
      },
    },
  },
);

// Hash password before saving
userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<IUserDocument>('User', userSchema);
