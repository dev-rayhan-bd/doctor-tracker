import { UserModel } from '@/modules/user/user.model';
import { DoctorModel } from '@/modules/doctor/doctor.model';
import { PatientModel } from '@/modules/patient/patient.model';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export const seedAllData = async (): Promise<void> => {
  try {
    logger.info('🔄 Checking and starting comprehensive database seeding...');

    // 1. Seed Super Admin
    const isSuperAdminExists = await UserModel.findOne({
      $or: [{ email: env.ADMIN_EMAIL }, { role: 'SUPER_ADMIN' }],
    });

    if (!isSuperAdminExists) {
      await UserModel.create({
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
      });
      logger.info(`✅ Super Admin seeded: ${env.ADMIN_EMAIL}`);
    } else {
      logger.info('ℹ️ Super Admin already exists.');
    }

    // 2. Check if Doctors already exist
    const doctorCount = await DoctorModel.countDocuments();
    if (doctorCount > 0) {
      logger.info(
        `ℹ️ ${doctorCount} doctors already exist in database. Skipping doctor & patient generation to prevent duplication.`,
      );
      return;
    }

    logger.info('🌱 Seeding realistic Doctors and Patients with date distributions...');

    // Helper for realistic dates over the last 14 days
    const now = new Date();
    const daysAgo = (days: number): Date => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      d.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
      return d;
    };

    // 3. Realistic Doctors Data
    const doctorsData = [
      {
        name: 'Dr. Farhan Rahman',
        specialization: 'Cardiology',
        hospital: 'Evercare Hospital',
        phone: '+8801711001122',
        email: 'dr.farhan@evercare.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(14),
        updatedAt: daysAgo(14),
      },
      {
        name: 'Dr. Nusrat Jahan',
        specialization: 'Neurology',
        hospital: 'Square Hospital',
        phone: '+8801812334455',
        email: 'dr.nusrat@square.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(12),
        updatedAt: daysAgo(12),
      },
      {
        name: 'Dr. Tanvir Hossain',
        specialization: 'Orthopedics',
        hospital: 'Apollo Hospital',
        phone: '+8801913556677',
        email: 'dr.tanvir@apollo.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(11),
        updatedAt: daysAgo(11),
      },
      {
        name: 'Dr. Anika Tabassum',
        specialization: 'Pediatrics',
        hospital: 'United Hospital',
        phone: '+8801614778899',
        email: 'dr.anika@united.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10),
      },
      {
        name: 'Dr. Mahmudul Hasan',
        specialization: 'General Surgery',
        hospital: 'Dhaka Medical College Hospital',
        phone: '+8801515990011',
        email: 'dr.mahmudul@dmc.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(8),
        updatedAt: daysAgo(8),
      },
      {
        name: 'Dr. Sadia Afroze',
        specialization: 'Dermatology',
        hospital: 'Evercare Hospital',
        phone: '+8801716112233',
        email: 'dr.sadia@evercare.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(7),
        updatedAt: daysAgo(7),
      },
      {
        name: 'Dr. Kamal Uddin',
        specialization: 'Nephrology',
        hospital: 'Square Hospital',
        phone: '+8801817223344',
        email: 'dr.kamal@square.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5),
      },
      {
        name: 'Dr. Rifat Chowdhury',
        specialization: 'Internal Medicine',
        hospital: 'United Hospital',
        phone: '+8801918334455',
        email: 'dr.rifat@united.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
      },
      {
        name: 'Dr. Mehnaz Parveen',
        specialization: 'Gynecology & Obstetrics',
        hospital: 'Apollo Hospital',
        phone: '+8801619445566',
        email: 'dr.mehnaz@apollo.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },
      {
        name: 'Dr. Tariqul Islam',
        specialization: 'Oncology',
        hospital: 'National Cancer Research Hospital',
        phone: '+8801520556677',
        email: 'dr.tariqul@cancerhospital.org',
        status: 'ACTIVE' as const,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
    ];

    const createdDoctors = await DoctorModel.insertMany(doctorsData);
    logger.info(`✅ Successfully seeded ${createdDoctors.length} doctors!`);

    // 4. Realistic Patients Data Distributed among Doctors
    const patientsData = [
      // Dr. Farhan Rahman (Cardiology)
      {
        name: 'Rahim Sheikh',
        age: 58,
        gender: 'MALE' as const,
        phone: '+8801720011221',
        email: 'rahim.sheikh@example.com',
        doctor: createdDoctors[0]._id,
        condition: 'Critical' as const,
        diagnosis: 'Acute Coronary Syndrome & Hypertension',
        admissionDate: daysAgo(9),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(9),
        updatedAt: daysAgo(9),
      },
      {
        name: 'Fatema Begum',
        age: 62,
        gender: 'FEMALE' as const,
        phone: '+8801821122332',
        email: 'fatema.begum@example.com',
        doctor: createdDoctors[0]._id,
        condition: 'Stable' as const,
        diagnosis: 'Congestive Heart Failure (Compensated)',
        admissionDate: daysAgo(6),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(6),
        updatedAt: daysAgo(6),
      },
      {
        name: 'Abul Kashem',
        age: 45,
        gender: 'MALE' as const,
        phone: '+8801922233443',
        email: 'kashem.abul@example.com',
        doctor: createdDoctors[0]._id,
        condition: 'Recovered' as const,
        diagnosis: 'Post-Angioplasty Recovery',
        admissionDate: daysAgo(12),
        status: 'DISCHARGED' as const,
        createdAt: daysAgo(12),
        updatedAt: daysAgo(2),
      },
      {
        name: 'Monira Sultana',
        age: 51,
        gender: 'FEMALE' as const,
        phone: '+8801623344554',
        email: 'monira.sultana@example.com',
        doctor: createdDoctors[0]._id,
        condition: 'Serious' as const,
        diagnosis: 'Severe Arrhythmia & Ischemic Heart Disease',
        admissionDate: daysAgo(3),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },

      // Dr. Nusrat Jahan (Neurology)
      {
        name: 'Zahangir Alam',
        age: 64,
        gender: 'MALE' as const,
        phone: '+8801524455665',
        email: 'zahangir.alam@example.com',
        doctor: createdDoctors[1]._id,
        condition: 'Critical' as const,
        diagnosis: 'Ischemic Stroke with Right-side Hemiparesis',
        admissionDate: daysAgo(8),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(8),
        updatedAt: daysAgo(8),
      },
      {
        name: 'Taslima Akhter',
        age: 34,
        gender: 'FEMALE' as const,
        phone: '+8801725566776',
        email: 'taslima.akhter@example.com',
        doctor: createdDoctors[1]._id,
        condition: 'Stable' as const,
        diagnosis: 'Chronic Migraine with Aura',
        admissionDate: daysAgo(5),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5),
      },
      {
        name: 'Shafiqur Rahman',
        age: 70,
        gender: 'MALE' as const,
        phone: '+8801826677887',
        email: 'shafiq.rahman@example.com',
        doctor: createdDoctors[1]._id,
        condition: 'Under Observation' as const,
        diagnosis: 'Early Stage Parkinson Disease',
        admissionDate: daysAgo(2),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },

      // Dr. Tanvir Hossain (Orthopedics)
      {
        name: 'Biplob Barua',
        age: 28,
        gender: 'MALE' as const,
        phone: '+8801927788998',
        email: 'biplob.barua@example.com',
        doctor: createdDoctors[2]._id,
        condition: 'Recovered' as const,
        diagnosis: 'Right Tibia Fracture Post-ORIF',
        admissionDate: daysAgo(10),
        status: 'DISCHARGED' as const,
        createdAt: daysAgo(10),
        updatedAt: daysAgo(1),
      },
      {
        name: 'Rokeya Khatun',
        age: 59,
        gender: 'FEMALE' as const,
        phone: '+8801628899009',
        email: 'rokeya.khatun@example.com',
        doctor: createdDoctors[2]._id,
        condition: 'Stable' as const,
        diagnosis: 'Severe Bilateral Knee Osteoarthritis',
        admissionDate: daysAgo(4),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
      },
      {
        name: 'Tanvir Ahmed',
        age: 22,
        gender: 'MALE' as const,
        phone: '+8801529900110',
        email: 'tanvir.sports@example.com',
        doctor: createdDoctors[2]._id,
        condition: 'Under Observation' as const,
        diagnosis: 'ACL Tear Right Knee (Sports Injury)',
        admissionDate: daysAgo(1),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },

      // Dr. Anika Tabassum (Pediatrics)
      {
        name: 'Ayaan Kabir',
        age: 5,
        gender: 'MALE' as const,
        phone: '+8801730011223',
        email: 'kabir.parent@example.com',
        doctor: createdDoctors[3]._id,
        condition: 'Recovered' as const,
        diagnosis: 'Acute Bronchiolitis',
        admissionDate: daysAgo(9),
        status: 'DISCHARGED' as const,
        createdAt: daysAgo(9),
        updatedAt: daysAgo(3),
      },
      {
        name: 'Inaya Haque',
        age: 3,
        gender: 'FEMALE' as const,
        phone: '+8801831122334',
        email: 'haque.parent@example.com',
        doctor: createdDoctors[3]._id,
        condition: 'Stable' as const,
        diagnosis: 'Viral Gastroenteritis & Mild Dehydration',
        admissionDate: daysAgo(3),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },
      {
        name: 'Rayyan Chowdhury',
        age: 8,
        gender: 'MALE' as const,
        phone: '+8801932233445',
        email: 'rayyan.parent@example.com',
        doctor: createdDoctors[3]._id,
        condition: 'Serious' as const,
        diagnosis: 'Dengue Fever with Warning Signs',
        admissionDate: daysAgo(2),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },

      // Dr. Mahmudul Hasan (General Surgery)
      {
        name: 'Mizanur Rahman',
        age: 46,
        gender: 'MALE' as const,
        phone: '+8801633344556',
        email: 'mizan.rahman@example.com',
        doctor: createdDoctors[4]._id,
        condition: 'Stable' as const,
        diagnosis: 'Post-Laparoscopic Cholecystectomy',
        admissionDate: daysAgo(7),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(7),
        updatedAt: daysAgo(7),
      },
      {
        name: 'Sharmin Jahan',
        age: 38,
        gender: 'FEMALE' as const,
        phone: '+8801534455667',
        email: 'sharmin.jahan@example.com',
        doctor: createdDoctors[4]._id,
        condition: 'Critical' as const,
        diagnosis: 'Acute Perforated Appendicitis with Peritonitis',
        admissionDate: daysAgo(4),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
      },

      // Dr. Sadia Afroze (Dermatology)
      {
        name: 'Nafisa Anjum',
        age: 26,
        gender: 'FEMALE' as const,
        phone: '+8801735566778',
        email: 'nafisa.anjum@example.com',
        doctor: createdDoctors[5]._id,
        condition: 'Stable' as const,
        diagnosis: 'Severe Plaque Psoriasis',
        admissionDate: daysAgo(6),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(6),
        updatedAt: daysAgo(6),
      },
      {
        name: 'Samiul Hasan',
        age: 31,
        gender: 'MALE' as const,
        phone: '+8801836677889',
        email: 'samiul.hasan@example.com',
        doctor: createdDoctors[5]._id,
        condition: 'Recovered' as const,
        diagnosis: 'Acute Drug Eruption (Resolved)',
        admissionDate: daysAgo(5),
        status: 'DISCHARGED' as const,
        createdAt: daysAgo(5),
        updatedAt: daysAgo(1),
      },

      // Dr. Kamal Uddin (Nephrology)
      {
        name: 'Delwar Hossain',
        age: 67,
        gender: 'MALE' as const,
        phone: '+8801937788990',
        email: 'delwar.hossain@example.com',
        doctor: createdDoctors[6]._id,
        condition: 'Critical' as const,
        diagnosis: 'End Stage Renal Disease on Hemodialysis',
        admissionDate: daysAgo(4),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
      },
      {
        name: 'Hasina Momtaz',
        age: 53,
        gender: 'FEMALE' as const,
        phone: '+8801638899001',
        email: 'hasina.momtaz@example.com',
        doctor: createdDoctors[6]._id,
        condition: 'Serious' as const,
        diagnosis: 'Acute Kidney Injury secondary to Sepsis',
        admissionDate: daysAgo(2),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        name: 'Shah Alam',
        age: 49,
        gender: 'MALE' as const,
        phone: '+8801539900112',
        email: 'shah.alam@example.com',
        doctor: createdDoctors[6]._id,
        condition: 'Stable' as const,
        diagnosis: 'Nephrotic Syndrome in Remission',
        admissionDate: daysAgo(3),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },

      // Dr. Rifat Chowdhury (Internal Medicine)
      {
        name: 'Anwarul Huq',
        age: 55,
        gender: 'MALE' as const,
        phone: '+8801740011224',
        email: 'anwar.huq@example.com',
        doctor: createdDoctors[7]._id,
        condition: 'Stable' as const,
        diagnosis: 'Uncontrolled Type 2 Diabetes & Dyslipidemia',
        admissionDate: daysAgo(4),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
      },
      {
        name: 'Salma Parveen',
        age: 42,
        gender: 'FEMALE' as const,
        phone: '+8801841122335',
        email: 'salma.parveen@example.com',
        doctor: createdDoctors[7]._id,
        condition: 'Under Observation' as const,
        diagnosis: 'Pyrexia of Unknown Origin (PUO)',
        admissionDate: daysAgo(2),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },

      // Dr. Mehnaz Parveen (Gynecology & Obstetrics)
      {
        name: 'Nusrat Fariha',
        age: 29,
        gender: 'FEMALE' as const,
        phone: '+8801942233446',
        email: 'nusrat.fariha@example.com',
        doctor: createdDoctors[8]._id,
        condition: 'Recovered' as const,
        diagnosis: 'Elective Lower Segment Cesarean Section (LSCS)',
        admissionDate: daysAgo(3),
        status: 'DISCHARGED' as const,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(1),
      },
      {
        name: 'Farzana Yesmin',
        age: 33,
        gender: 'FEMALE' as const,
        phone: '+8801643344557',
        email: 'farzana.yesmin@example.com',
        doctor: createdDoctors[8]._id,
        condition: 'Serious' as const,
        diagnosis: 'Severe Pre-eclampsia at 34 Weeks Gestation',
        admissionDate: daysAgo(2),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },

      // Dr. Tariqul Islam (Oncology)
      {
        name: 'Khorshed Alam',
        age: 63,
        gender: 'MALE' as const,
        phone: '+8801544455668',
        email: 'khorshed.alam@example.com',
        doctor: createdDoctors[9]._id,
        condition: 'Critical' as const,
        diagnosis: 'Non-Small Cell Lung Carcinoma Stage IIIB',
        admissionDate: daysAgo(1),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
      {
        name: 'Sabina Yasmin',
        age: 48,
        gender: 'FEMALE' as const,
        phone: '+8801745566779',
        email: 'sabina.yasmin@example.com',
        doctor: createdDoctors[9]._id,
        condition: 'Under Observation' as const,
        diagnosis: 'Post-Chemotherapy Cycle 3 Monitoring',
        admissionDate: daysAgo(1),
        status: 'ACTIVE' as const,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
    ];

    const createdPatients = await PatientModel.insertMany(patientsData);
    logger.info(
      `✅ Successfully seeded ${createdPatients.length} patients associated with doctors!`,
    );
    logger.info('🎉 All required database collections seeded with zero inconsistency!');
  } catch (error) {
    logger.error({ err: error }, '❌ Comprehensive seeding failed');
    throw error;
  }
};
