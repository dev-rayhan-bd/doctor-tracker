import { z } from 'zod';

const userRoleEnum = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'DOCTOR',
  'USER',
  'PLAYER',
  'COACH',
  'GUARDIAN',
  'SCOUT',
]);
const userStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);

export const createUserZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: userRoleEnum.optional().default('USER'),
    status: userStatusEnum.optional().default('ACTIVE'),
  }),
});

export const loginUserZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyOtpZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
});

export const resendOtpZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const changePasswordZodSchema = z.object({
  body: z
    .object({
      oldPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(6, 'New password must be at least 6 characters'),
      confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'New password and confirm password do not match',
      path: ['confirmPassword'],
    }),
});

export const forgotPasswordZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const verifyForgotPasswordOtpZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
});

export const resetPasswordZodSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email address'),
      newPassword: z.string().min(6, 'New password must be at least 6 characters'),
      confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
      token: z.string().optional(),
      otp: z.string().length(6, 'OTP must be exactly 6 digits').optional(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
    .refine((data) => data.token || data.otp, {
      message: 'Either reset token or OTP is required to reset password',
      path: ['token'],
    }),
});

export const refreshTokenZodSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const updateUserZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    role: userRoleEnum.optional(),
    status: userStatusEnum.optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  loginUserZodSchema,
  verifyOtpZodSchema,
  resendOtpZodSchema,
  changePasswordZodSchema,
  forgotPasswordZodSchema,
  verifyForgotPasswordOtpZodSchema,
  resetPasswordZodSchema,
  refreshTokenZodSchema,
  updateUserZodSchema,
};
