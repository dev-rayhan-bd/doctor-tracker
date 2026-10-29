import { Schema, model } from 'mongoose';
import { IDoctorDocument } from './doctor.interface';

const doctorSchema = new Schema<IDoctorDocument>(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    hospital: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Explicit Compound Indexes for fast searching and combined filtering
doctorSchema.index({ specialization: 1, hospital: 1 });
doctorSchema.index({ name: 1, specialization: 1 });
doctorSchema.index({ createdAt: -1 });

export const DoctorModel = model<IDoctorDocument>('Doctor', doctorSchema);
