import { StatusCodes } from 'http-status-codes';
import { IDoctor, IDoctorDocument } from './doctor.interface';
import { doctorRepository, DoctorRepository } from './doctor.repository';
import { DoctorModel } from './doctor.model';
import { PatientModel } from '../patient/patient.model';
import { IPatient, IPatientDocument } from '../patient/patient.interface';
import { AppError } from '@/utils/AppError';
import QueryBuilder from '@/builder/QueryBuilder';

export class DoctorService {
  constructor(private readonly doctorRepo: DoctorRepository) {}

  async createDoctor(doctorData: Partial<IDoctor>): Promise<IDoctorDocument> {
    const existing = await this.doctorRepo.findByEmail(doctorData.email!);
    if (existing) {
      throw new AppError(StatusCodes.CONFLICT, 'A doctor with this email already exists');
    }

    return this.doctorRepo.create(doctorData);
  }

  async getAllDoctors(query: Record<string, unknown>) {
    const doctorQuery = new QueryBuilder(DoctorModel.find(), query)
      .search(['name', 'specialization', 'hospital', 'email', 'phone'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const data = await doctorQuery.modelQuery;
    const meta = await doctorQuery.countTotal();

    return {
      meta,
      data,
    };
  }

  async getDoctorById(id: string): Promise<{ doctor: IDoctorDocument; patientCount: number }> {
    const doctor = await this.doctorRepo.findById(id);
    if (!doctor) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Doctor not found');
    }

    const patientCount = await PatientModel.countDocuments({ doctor: id });

    return {
      doctor,
      patientCount,
    };
  }

  async updateDoctor(id: string, updateData: Partial<IDoctor>): Promise<IDoctorDocument> {
    if (updateData.email) {
      const existing = await this.doctorRepo.findByEmail(updateData.email);
      if (existing && existing._id.toString() !== id) {
        throw new AppError(StatusCodes.CONFLICT, 'Email address is already used by another doctor');
      }
    }

    const doctor = await this.doctorRepo.updateById(id, updateData);
    if (!doctor) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Doctor not found');
    }
    return doctor;
  }

  async deleteDoctor(id: string): Promise<void> {
    const doctor = await this.doctorRepo.deleteById(id);
    if (!doctor) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Doctor not found');
    }

    // Also remove associated patients or unassign them to preserve database integrity
    await PatientModel.deleteMany({ doctor: id });
  }

  // Doctor-Patient Relationship Handlers
  async getDoctorPatients(doctorId: string, query: Record<string, unknown>) {
    const doctor = await this.doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Doctor not found');
    }

    const patientQuery = new QueryBuilder(PatientModel.find({ doctor: doctorId }), query)
      .search(['name', 'phone', 'email', 'condition', 'diagnosis'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const data = await patientQuery.modelQuery;
    const meta = await patientQuery.countTotal();

    return {
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
      },
      meta,
      data,
    };
  }

  async addPatientToDoctor(
    doctorId: string,
    patientData: Partial<IPatient>,
  ): Promise<IPatientDocument> {
    const doctor = await this.doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Doctor not found');
    }

    const newPatient = await PatientModel.create({
      ...patientData,
      doctor: doctor._id,
    });

    return newPatient;
  }

  async deletePatientFromDoctor(doctorId: string, patientId: string): Promise<void> {
    const doctor = await this.doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Doctor not found');
    }

    const deleted = await PatientModel.findOneAndDelete({
      _id: patientId,
      doctor: doctorId,
    });

    if (!deleted) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Patient not found under this doctor');
    }
  }
}

export const doctorService = new DoctorService(doctorRepository);
