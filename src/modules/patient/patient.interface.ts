import { Document, Types } from 'mongoose';

export type PatientCondition =
  'Critical' | 'Stable' | 'Recovered' | 'Under Observation' | 'Serious';

export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER';
export type PatientStatus = 'ACTIVE' | 'DISCHARGED';

export interface IPatient {
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  doctor: Types.ObjectId;
  condition: PatientCondition;
  diagnosis?: string;
  admissionDate?: Date;
  status: PatientStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPatientDocument extends IPatient, Document {}
