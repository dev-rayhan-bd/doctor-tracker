import { StatusCodes } from 'http-status-codes';
import { IPatient, IPatientDocument } from './patient.interface';
import { patientRepository, PatientRepository } from './patient.repository';
import { PatientModel } from './patient.model';
import { DoctorModel } from '../doctor/doctor.model';
import { AppError } from '@/utils/AppError';
import QueryBuilder from '@/builder/QueryBuilder';

export class PatientService {
  constructor(private readonly patientRepo: PatientRepository) {}

  async createPatient(patientData: Partial<IPatient>): Promise<IPatientDocument> {
    if (patientData.doctor) {
      const doctorExists = await DoctorModel.findById(patientData.doctor);
      if (!doctorExists) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Assigned doctor was not found');
      }
    }

    const patient = await this.patientRepo.create(patientData);
    return (await this.patientRepo.findById(patient._id.toString()))!;
  }

  async getAllPatients(query: Record<string, unknown>) {
    const patientQuery = new QueryBuilder(
      PatientModel.find().populate('doctor', 'name specialization hospital email phone'),
      query,
    )
      .search(['name', 'phone', 'email', 'condition', 'diagnosis'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const data = await patientQuery.modelQuery;
    const meta = await patientQuery.countTotal();

    return {
      meta,
      data,
    };
  }

  async getPatientById(id: string): Promise<IPatientDocument> {
    const patient = await this.patientRepo.findById(id);
    if (!patient) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Patient not found');
    }
    return patient;
  }

  async updatePatient(id: string, updateData: Partial<IPatient>): Promise<IPatientDocument> {
    if (updateData.doctor) {
      const doctorExists = await DoctorModel.findById(updateData.doctor);
      if (!doctorExists) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Assigned doctor was not found');
      }
    }

    const patient = await this.patientRepo.updateById(id, updateData);
    if (!patient) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Patient not found');
    }
    return patient;
  }

  async deletePatient(id: string): Promise<void> {
    const patient = await this.patientRepo.deleteById(id);
    if (!patient) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Patient not found');
    }
  }
}

export const patientService = new PatientService(patientRepository);
