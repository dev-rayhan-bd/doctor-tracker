import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { patientService, PatientService } from './patient.service';
import { catchAsync } from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';

export class PatientController {
  constructor(private readonly service: PatientService) {}

  create = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const patient = await this.service.createPatient(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Patient registered successfully',
      data: patient,
    });
  });

  getAll = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getAllPatients(req.query);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Patients retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  });

  getById = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const patient = await this.service.getPatientById(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Patient retrieved successfully',
      data: patient,
    });
  });

  update = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const patient = await this.service.updatePatient(req.params.id, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Patient updated successfully',
      data: patient,
    });
  });

  delete = catchAsync(async (req: Request, res: Response): Promise<void> => {
    await this.service.deletePatient(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Patient deleted successfully',
    });
  });
}

export const patientController = new PatientController(patientService);
