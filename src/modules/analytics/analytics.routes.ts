import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { auth } from '@/middlewares/auth.middleware';

const router = Router();

// Protect all analytics endpoints
router.use(auth());

router.get('/dashboard', analyticsController.getDashboardAnalytics);

export const AnalyticsRoutes = router;
