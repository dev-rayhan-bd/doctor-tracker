import { IPatient, IPatientDocument } from './patient.interface';
import { PatientModel } from './patient.model';

export class PatientRepository {
  async create(patientData: Partial<IPatient>): Promise<IPatientDocument> {
    return PatientModel.create(patientData);
  }

  async findById(id: string, populateDoctor = true): Promise<IPatientDocument | null> {
    const query = PatientModel.findById(id);
    if (populateDoctor) {
      query.populate('doctor', 'name specialization hospital email phone');
    }
    return query.exec();
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<IPatientDocument[]> {
    return PatientModel.find(filter).populate('doctor', 'name specialization hospital').exec();
  }

  async updateById(id: string, updateData: Partial<IPatient>): Promise<IPatientDocument | null> {
    return PatientModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('doctor', 'name specialization hospital')
      .exec();
  }

  async deleteById(id: string): Promise<IPatientDocument | null> {
    return PatientModel.findByIdAndDelete(id).exec();
  }

  async deleteByDoctorAndPatient(
    doctorId: string,
    patientId: string,
  ): Promise<IPatientDocument | null> {
    return PatientModel.findOneAndDelete({ _id: patientId, doctor: doctorId }).exec();
  }
}

export const patientRepository = new PatientRepository();
