import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userService, UserService } from './user.service';
import { catchAsync } from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';

export class UserController {
  constructor(private readonly service: UserService) {}

  register = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const user = await this.service.registerUser(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'User registered successfully. A verification OTP has been sent to your email.',
      data: user,
    });
  });

  login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await this.service.loginUser(email, password);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User logged in successfully',
      data: result,
    });
  });

  verifyOtp = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    await this.service.verifyOtp(email, otp);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  });

  resendOtp = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    await this.service.resendOtp(email);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'A new verification OTP has been sent to your email.',
    });
  });

  refreshToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await this.service.refreshToken(refreshToken);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Tokens refreshed successfully',
      data: result,
    });
  });

  changePassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { oldPassword, newPassword } = req.body;
    await this.service.changePassword(userId, oldPassword, newPassword);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Password changed successfully',
    });
  });

  forgotPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    await this.service.forgotPassword(email);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'If an account exists with this email, a password reset OTP has been sent.',
    });
  });

  verifyForgotPasswordOtp = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const result = await this.service.verifyForgotPasswordOtp(email, otp);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'OTP verified successfully. You may now reset your password.',
      data: result,
    });
  });

  resetPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    await this.service.resetPassword(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  });

  getProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const user = await this.service.getUserById(userId);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  });

  getAll = catchAsync(async (_req: Request, res: Response): Promise<void> => {
    const users = await this.service.getAllUsers();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  });

  getById = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const user = await this.service.getUserById(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  });

  update = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const user = await this.service.updateUser(req.params.id, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  });

  delete = catchAsync(async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteUser(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User deleted successfully',
    });
  });
}

export const userController = new UserController(userService);
