import { Router } from 'express';
import { userController } from './user.controller';
import { UserValidation } from './user.validation';
import { validateRequest } from '@/middlewares/validateRequest';
import { auth } from '@/middlewares/auth.middleware';
import { authRateLimiter, searchRateLimiter } from '@/config/rateLimit.config';

const router = Router();

// ==========================================
// Public Authentication Routes (Strict Rate Limiting)
// ==========================================
router.post(
  '/register',
  authRateLimiter,
  validateRequest(UserValidation.createUserZodSchema),
  userController.register,
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest(UserValidation.loginUserZodSchema),
  userController.login,
);

router.post(
  '/verify-otp',
  authRateLimiter,
  validateRequest(UserValidation.verifyOtpZodSchema),
  userController.verifyOtp,
);

router.post(
  '/resend-otp',
  authRateLimiter,
  validateRequest(UserValidation.resendOtpZodSchema),
  userController.resendOtp,
);

router.post(
  '/refresh-token',
  authRateLimiter,
  validateRequest(UserValidation.refreshTokenZodSchema),
  userController.refreshToken,
);

router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest(UserValidation.forgotPasswordZodSchema),
  userController.forgotPassword,
);

router.post(
  '/verify-forgot-password-otp',
  authRateLimiter,
  validateRequest(UserValidation.verifyForgotPasswordOtpZodSchema),
  userController.verifyForgotPasswordOtp,
);

router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest(UserValidation.resetPasswordZodSchema),
  userController.resetPassword,
);

// ==========================================
// Protected Routes (Authenticated User)
// ==========================================
router.get('/me', auth(), userController.getProfile);

router.post(
  '/change-password',
  auth(),
  validateRequest(UserValidation.changePasswordZodSchema),
  userController.changePassword,
);

// ==========================================
// Admin / Management Routes
// ==========================================
router.get('/search', auth('ADMIN', 'SUPER_ADMIN'), searchRateLimiter, userController.getAll);
router.get('/', auth('ADMIN', 'SUPER_ADMIN'), userController.getAll);
router.get('/:id', auth('ADMIN', 'SUPER_ADMIN'), userController.getById);
router.patch(
  '/:id',
  auth('ADMIN', 'SUPER_ADMIN'),
  validateRequest(UserValidation.updateUserZodSchema),
  userController.update,
);
router.delete('/:id', auth('SUPER_ADMIN'), userController.delete);

export const UserRoutes = router;
