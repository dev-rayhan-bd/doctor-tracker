import { Router } from 'express';
import { doctorController } from './doctor.controller';
import { DoctorValidation } from './doctor.validation';
import { PatientValidation } from '../patient/patient.validation';
import { validateRequest } from '@/middlewares/validateRequest';
import { auth } from '@/middlewares/auth.middleware';

const router = Router();

// Protect all Doctor routes with Auth middleware
router.use(auth());

router.post('/', validateRequest(DoctorValidation.createDoctorZodSchema), doctorController.create);

router.get('/', doctorController.getAll);

router.get('/:id', doctorController.getById);

router.patch(
  '/:id',
  validateRequest(DoctorValidation.updateDoctorZodSchema),
  doctorController.update,
);

router.delete('/:id', doctorController.delete);

// Doctor - Patient Relationship Routes
router.get('/:id/patients', doctorController.getDoctorPatients);

router.post(
  '/:id/patients',
  validateRequest(PatientValidation.createPatientUnderDoctorZodSchema),
  doctorController.addPatientToDoctor,
);

router.delete('/:doctorId/patients/:patientId', doctorController.deletePatientFromDoctor);

export const DoctorRoutes = router;
