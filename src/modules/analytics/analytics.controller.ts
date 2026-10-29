import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { analyticsService, AnalyticsService } from './analytics.service';
import { catchAsync } from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  getDashboardAnalytics = catchAsync(async (_req: Request, res: Response): Promise<void> => {
    const analytics = await this.service.getDashboardAnalytics();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data: analytics,
    });
  });
}

export const analyticsController = new AnalyticsController(analyticsService);
