import { IDoctor, IDoctorDocument } from './doctor.interface';
import { DoctorModel } from './doctor.model';

export class DoctorRepository {
  async create(doctorData: Partial<IDoctor>): Promise<IDoctorDocument> {
    return DoctorModel.create(doctorData);
  }

  async findByEmail(email: string): Promise<IDoctorDocument | null> {
    return DoctorModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<IDoctorDocument | null> {
    return DoctorModel.findById(id).exec();
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<IDoctorDocument[]> {
    return DoctorModel.find(filter).exec();
  }

  async updateById(id: string, updateData: Partial<IDoctor>): Promise<IDoctorDocument | null> {
    return DoctorModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<IDoctorDocument | null> {
    return DoctorModel.findByIdAndDelete(id).exec();
  }
}

export const doctorRepository = new DoctorRepository();
