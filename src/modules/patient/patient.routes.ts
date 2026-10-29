import { Router } from 'express';
import { patientController } from './patient.controller';
import { PatientValidation } from './patient.validation';
import { validateRequest } from '@/middlewares/validateRequest';
import { auth } from '@/middlewares/auth.middleware';

const router = Router();

// All Patient routes are protected - authentication required
router.use(auth());

router.post(
  '/',
  validateRequest(PatientValidation.createPatientZodSchema),
  patientController.create,
);

router.get('/', patientController.getAll);

router.get('/:id', patientController.getById);

router.patch(
  '/:id',
  validateRequest(PatientValidation.updatePatientZodSchema),
  patientController.update,
);

router.delete('/:id', patientController.delete);

export const PatientRoutes = router;
