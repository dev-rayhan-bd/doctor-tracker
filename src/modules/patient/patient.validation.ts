import { z } from 'zod';

const patientConditionEnum = z.enum([
  'Critical',
  'Stable',
  'Recovered',
  'Under Observation',
  'Serious',
]);

const patientGenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);
const patientStatusEnum = z.enum(['ACTIVE', 'DISCHARGED']);

export const createPatientZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Patient name must be at least 2 characters'),
    age: z.coerce.number().min(0, 'Age must be 0 or greater').max(130, 'Age must be valid'),
    gender: patientGenderEnum,
    phone: z.string().min(6, 'Valid phone number is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    doctor: z.string().min(24, 'Valid doctor ID is required'),
    condition: patientConditionEnum.optional().default('Stable'),
    diagnosis: z.string().optional(),
    admissionDate: z.string().optional(),
    status: patientStatusEnum.optional().default('ACTIVE'),
  }),
});

export const createPatientUnderDoctorZodSchema = z.object({
  params: z.object({
    id: z.string().min(24, 'Doctor ID must be a valid MongoDB ObjectId'),
  }),
  body: z.object({
    name: z.string().min(2, 'Patient name must be at least 2 characters'),
    age: z.coerce.number().min(0, 'Age must be 0 or greater').max(130, 'Age must be valid'),
    gender: patientGenderEnum,
    phone: z.string().min(6, 'Valid phone number is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    condition: patientConditionEnum.optional().default('Stable'),
    diagnosis: z.string().optional(),
    admissionDate: z.string().optional(),
    status: patientStatusEnum.optional().default('ACTIVE'),
  }),
});

export const updatePatientZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Patient name must be at least 2 characters').optional(),
    age: z.coerce
      .number()
      .min(0, 'Age must be 0 or greater')
      .max(130, 'Age must be valid')
      .optional(),
    gender: patientGenderEnum.optional(),
    phone: z.string().min(6, 'Valid phone number is required').optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    doctor: z.string().min(24, 'Valid doctor ID is required').optional(),
    condition: patientConditionEnum.optional(),
    diagnosis: z.string().optional(),
    admissionDate: z.string().optional(),
    status: patientStatusEnum.optional(),
  }),
});

export const PatientValidation = {
  createPatientZodSchema,
  createPatientUnderDoctorZodSchema,
  updatePatientZodSchema,
};
