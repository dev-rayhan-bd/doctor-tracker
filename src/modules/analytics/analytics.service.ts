import { DoctorModel } from '../doctor/doctor.model';
import { PatientModel } from '../patient/patient.model';

export class AnalyticsService {
  async getDashboardAnalytics() {
    // 1. High-Performance Aggregation Pipeline on Patients
    const [patientAggregationResult] = await PatientModel.aggregate([
      {
        $facet: {
          totalPatients: [{ $count: 'count' }],
          conditionStats: [
            {
              $group: {
                _id: '$condition',
                count: { $sum: 1 },
              },
            },
          ],
          patientsPerDoctor: [
            {
              $group: {
                _id: '$doctor',
                patientCount: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: 'doctors',
                localField: '_id',
                foreignField: '_id',
                as: 'doctorInfo',
              },
            },
            {
              $unwind: '$doctorInfo',
            },
            {
              $project: {
                _id: 0,
                doctorId: '$_id',
                doctorName: '$doctorInfo.name',
                specialization: '$doctorInfo.specialization',
                hospital: '$doctorInfo.hospital',
                patientCount: 1,
              },
            },
            {
              $sort: { patientCount: -1 },
            },
          ],
          dateBasedPatientStats: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                date: '$_id',
                patients: '$count',
              },
            },
            {
              $sort: { date: 1 },
            },
          ],
        },
      },
    ]);

    // 2. High-Performance Aggregation Pipeline on Doctors
    const [doctorAggregationResult] = await DoctorModel.aggregate([
      {
        $facet: {
          totalDoctors: [{ $count: 'count' }],
          specializationStats: [
            {
              $group: {
                _id: '$specialization',
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                specialization: '$_id',
                count: 1,
              },
            },
            {
              $sort: { count: -1 },
            },
          ],
          dateBasedDoctorStats: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                date: '$_id',
                doctors: '$count',
              },
            },
            {
              $sort: { date: 1 },
            },
          ],
        },
      },
    ]);

    // Extract KPI Metrics
    const totalDoctors = doctorAggregationResult?.totalDoctors?.[0]?.count || 0;
    const totalPatients = patientAggregationResult?.totalPatients?.[0]?.count || 0;

    const conditionBreakdown: Record<string, number> = {};
    if (patientAggregationResult?.conditionStats) {
      patientAggregationResult.conditionStats.forEach((item: { _id: string; count: number }) => {
        conditionBreakdown[item._id] = item.count;
      });
    }

    // Merge Date-based Trends (Doctors & Patients by Date)
    const trendMap = new Map<string, { date: string; patients: number; doctors: number }>();

    (patientAggregationResult?.dateBasedPatientStats || []).forEach(
      (item: { date: string; patients: number }) => {
        trendMap.set(item.date, { date: item.date, patients: item.patients, doctors: 0 });
      },
    );

    (doctorAggregationResult?.dateBasedDoctorStats || []).forEach(
      (item: { date: string; doctors: number }) => {
        if (trendMap.has(item.date)) {
          trendMap.get(item.date)!.doctors = item.doctors;
        } else {
          trendMap.set(item.date, { date: item.date, patients: 0, doctors: item.doctors });
        }
      },
    );

    const dateBasedStatistics = Array.from(trendMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return {
      kpi: {
        totalDoctors,
        totalPatients,
        criticalPatients: conditionBreakdown['Critical'] || 0,
        stablePatients: conditionBreakdown['Stable'] || 0,
        recoveredPatients: conditionBreakdown['Recovered'] || 0,
        seriousPatients: conditionBreakdown['Serious'] || 0,
        underObservationPatients: conditionBreakdown['Under Observation'] || 0,
      },
      charts: {
        patientsPerDoctor: patientAggregationResult?.patientsPerDoctor || [],
        dateBasedStatistics,
        conditionDistribution: patientAggregationResult?.conditionStats || [],
        specializationDistribution: doctorAggregationResult?.specializationStats || [],
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
