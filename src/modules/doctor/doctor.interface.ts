import { Document } from 'mongoose';

export type DoctorStatus = 'ACTIVE' | 'INACTIVE';

export interface IDoctor {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  status: DoctorStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDoctorDocument extends IDoctor, Document {}
