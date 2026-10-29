import { Router } from 'express';
import { UserRoutes } from '@/modules/user/user.routes';
import { DoctorRoutes } from '@/modules/doctor/doctor.routes';
import { PatientRoutes } from '@/modules/patient/patient.routes';
import { AnalyticsRoutes } from '@/modules/analytics/analytics.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/doctors',
    route: DoctorRoutes,
  },
  {
    path: '/patients',
    route: PatientRoutes,
  },
  {
    path: '/analytics',
    route: AnalyticsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const applicationRoutes = router;
