import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { doctorService, DoctorService } from './doctor.service';
import { catchAsync } from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';

export class DoctorController {
  constructor(private readonly service: DoctorService) {}

  create = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const doctor = await this.service.createDoctor(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Doctor created successfully',
      data: doctor,
    });
  });

  getAll = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getAllDoctors(req.query);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Doctors retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  });

  getById = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getDoctorById(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Doctor details retrieved successfully',
      data: result,
    });
  });

  update = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const doctor = await this.service.updateDoctor(req.params.id, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Doctor updated successfully',
      data: doctor,
    });
  });

  delete = catchAsync(async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteDoctor(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Doctor and associated records deleted successfully',
    });
  });

  getDoctorPatients = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getDoctorPatients(req.params.id, req.query);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Doctor patients retrieved successfully',
      meta: result.meta,
      data: result,
    });
  });

  addPatientToDoctor = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const patient = await this.service.addPatientToDoctor(req.params.id, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Patient added under doctor successfully',
      data: patient,
    });
  });

  deletePatientFromDoctor = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { doctorId, patientId } = req.params;
    await this.service.deletePatientFromDoctor(doctorId, patientId);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Patient removed from doctor successfully',
    });
  });
}

export const doctorController = new DoctorController(doctorService);
