import { z } from 'zod';

export const createDoctorZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    specialization: z.string().min(2, 'Specialization is required'),
    hospital: z.string().min(2, 'Hospital is required'),
    phone: z.string().min(6, 'Valid phone number is required'),
    email: z.string().email('Invalid email address'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
});

export const updateDoctorZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    specialization: z.string().min(2, 'Specialization is required').optional(),
    hospital: z.string().min(2, 'Hospital is required').optional(),
    phone: z.string().min(6, 'Valid phone number is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const DoctorValidation = {
  createDoctorZodSchema,
  updateDoctorZodSchema,
};
