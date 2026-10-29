import { Schema, model } from 'mongoose';
import { IPatientDocument } from './patient.interface';

const patientSchema = new Schema<IPatientDocument>(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Assigned doctor is required'],
      index: true,
    },
    condition: {
      type: String,
      enum: ['Critical', 'Stable', 'Recovered', 'Under Observation', 'Serious'],
      default: 'Stable',
      required: true,
      index: true,
    },
    diagnosis: {
      type: String,
      trim: true,
      default: '',
    },
    admissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISCHARGED'],
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

// High Performance Compound Indexes for Patient Management & Analytics
patientSchema.index({ doctor: 1, condition: 1 });
patientSchema.index({ doctor: 1, createdAt: -1 });
patientSchema.index({ condition: 1, createdAt: -1 });
patientSchema.index({ createdAt: -1 });

export const PatientModel = model<IPatientDocument>('Patient', patientSchema);
