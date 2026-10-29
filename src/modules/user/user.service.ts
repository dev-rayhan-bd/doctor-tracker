import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { IUser, IUserDocument, ILoginResponse } from './user.interface';
import { userRepository, UserRepository } from './user.repository';
import { AppError } from '@/utils/AppError';
import { env } from '@/config/env';
import { otpGenerator } from '@/utils/otpGenerator';
import { sendEmail } from '@/utils/sendEmail';

export interface IResetPasswordPayload {
  email: string;
  newPassword: string;
  token?: string;
  otp?: string;
}

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async registerUser(userData: Partial<IUser>): Promise<IUserDocument> {
    const existingUser = await this.userRepo.findByEmail(userData.email!);
    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, 'Email address is already registered');
    }

    // Generate 6-digit OTP with 10-minute validity
    const otp = otpGenerator.generate(6);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await this.userRepo.create({
      ...userData,
      isEmailVerified: false,
      otp,
      otpExpiresAt,
    });

    // Send verification email via direct Nodemailer utility
    await sendEmail({
      to: newUser.email,
      subject: 'Verify your Doctor Tracker Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; text-align: center;">Welcome to Doctor Tracker</h2>
          <p>Hello <b>${newUser.name}</b>,</p>
          <p>Thank you for registering. Please use the following 6-digit OTP code to verify your account email address:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code will expire in <b>10 minutes</b>. If you did not make this request, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Doctor Tracker Portal &copy; ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      `,
    });

    return newUser;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await this.userRepo.findByEmail(email, { includeOtp: true });
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.isEmailVerified) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Email is already verified');
    }

    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'OTP has expired or is invalid. Please request a new one.',
      );
    }

    if (user.otp !== otp) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid OTP code');
    }

    await this.userRepo.updateById(user._id.toString(), {
      isEmailVerified: true,
      otp: null,
      otpExpiresAt: null,
    });

    return true;
  }

  async resendOtp(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email, { includeOtp: true });
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User with this email was not found');
    }

    if (user.isEmailVerified) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Email address is already verified');
    }

    const otp = otpGenerator.generate(6);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.userRepo.updateById(user._id.toString(), {
      otp,
      otpExpiresAt,
    });

    await sendEmail({
      to: user.email,
      subject: 'Your New OTP Verification Code - Doctor Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; text-align: center;">Doctor Tracker Verification</h2>
          <p>Hello <b>${user.name}</b>,</p>
          <p>You requested a new verification code. Please use the code below:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code is valid for <b>10 minutes</b>.</p>
        </div>
      `,
    });
  }

  async loginUser(email: string, candidatePassword: string): Promise<ILoginResponse> {
    const user = await this.userRepo.findByEmail(email, { includePassword: true });
    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(candidatePassword);
    if (!isMatch) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    if (user.status === 'BLOCKED' || user.status === 'INACTIVE') {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        `Your account is currently ${user.status.toLowerCase()}`,
      );
    }

    if (!user.isEmailVerified) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Email is not verified. Please verify your email before logging in.',
      );
    }

    // Generate Access Token
    const accessToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
    );

    const userObj = user.toJSON() as unknown as IUser;

    return {
      user: userObj,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      const user = await this.userRepo.findById(decoded.userId);
      if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User no longer exists');
      }

      if (user.status === 'BLOCKED' || user.status === 'INACTIVE') {
        throw new AppError(StatusCodes.FORBIDDEN, `Account is ${user.status.toLowerCase()}`);
      }

      const newAccessToken = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        env.JWT_ACCESS_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
      );

      const newRefreshToken = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired refresh token');
    }
  }

  async changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
    const user = await this.userRepo.findById(userId, true);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    const isMatch = await user.comparePassword(oldPass);
    if (!isMatch) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Current password is incorrect');
    }

    if (oldPass === newPass) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'New password cannot be the same as the old password',
      );
    }

    user.password = newPass;
    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User with this email was not found');
    }

    const otp = otpGenerator.generate(6);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userRepo.updateById(user._id.toString(), {
      otp,
      otpExpiresAt,
    });

    await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP - Doctor Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #dc2626; text-align: center;">Reset Your Password</h2>
          <p>Hello <b>${user.name}</b>,</p>
          <p>We received a request to reset your password. Use the verification code below to proceed:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #dc2626; background-color: #fef2f2; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code will expire in <b>10 minutes</b>. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  async verifyForgotPasswordOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const user = await this.userRepo.findByEmail(email, { includeOtp: true });
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'OTP has expired or is invalid. Please request a new one.',
      );
    }

    if (user.otp !== otp) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid OTP code');
    }

    // Generate single-use reset token valid for 15 minutes
    const resetToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, type: 'PASSWORD_RESET' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' },
    );

    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save reset token and clear OTP
    await this.userRepo.updateById(user._id.toString(), {
      otp: null,
      otpExpiresAt: null,
      passwordResetToken: resetToken,
      passwordResetExpiresAt: resetExpiresAt,
    });

    return { resetToken };
  }

  async resetPassword(payload: IResetPasswordPayload): Promise<void> {
    const { email, newPassword, token, otp } = payload;

    const user = await this.userRepo.findByEmail(email, {
      includePassword: true,
      includeOtp: true,
      includeResetToken: true,
    });

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    let isAuthorized = false;

    // Verify via resetToken
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
          userId: string;
          email: string;
          type: string;
        };

        if (
          decoded.type === 'PASSWORD_RESET' &&
          decoded.email === email &&
          user.passwordResetToken === token &&
          user.passwordResetExpiresAt &&
          user.passwordResetExpiresAt > new Date()
        ) {
          isAuthorized = true;
        }
      } catch {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid or expired password reset token');
      }
    }

    // Verify via direct OTP
    if (!isAuthorized && otp) {
      if (user.otp === otp && user.otpExpiresAt && user.otpExpiresAt > new Date()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid or expired reset token or OTP');
    }

    // Update password (pre('save') hashes it automatically)
    user.password = newPassword;
    user.otp = null;
    user.otpExpiresAt = null;
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;

    await user.save();
  }

  async getUserById(id: string): Promise<IUserDocument> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
  }

  async getAllUsers(): Promise<IUserDocument[]> {
    return this.userRepo.findAll();
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUserDocument> {
    const user = await this.userRepo.updateById(id, updateData);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepo.deleteById(id);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }
  }
}

export const userService = new UserService(userRepository);
