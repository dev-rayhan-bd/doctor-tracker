import { IUser, IUserDocument } from './user.interface';
import { UserModel } from './user.model';

export interface IFindUserOptions {
  includePassword?: boolean;
  includeOtp?: boolean;
  includeResetToken?: boolean;
}

export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUserDocument> {
    return UserModel.create(userData);
  }

  async findByEmail(email: string, options: IFindUserOptions = {}): Promise<IUserDocument | null> {
    const query = UserModel.findOne({ email });
    const selectFields: string[] = [];

    if (options.includePassword) selectFields.push('+password');
    if (options.includeOtp) selectFields.push('+otp', '+otpExpiresAt');
    if (options.includeResetToken) {
      selectFields.push('+passwordResetToken', '+passwordResetExpiresAt');
    }

    if (selectFields.length > 0) {
      query.select(selectFields.join(' '));
    }
    return query.exec();
  }

  async findById(id: string, includePassword = false): Promise<IUserDocument | null> {
    const query = UserModel.findById(id);
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<IUserDocument[]> {
    return UserModel.find(filter).exec();
  }

  async updateById(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string): Promise<IUserDocument | null> {
    return UserModel.findByIdAndDelete(id).exec();
  }
}

export const userRepository = new UserRepository();
