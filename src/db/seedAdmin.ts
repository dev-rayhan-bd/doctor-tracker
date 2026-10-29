import { UserModel } from '@/modules/user/user.model';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export const seedAdmin = async (): Promise<void> => {
  try {
    const isSuperAdminExists = await UserModel.findOne({
      $or: [{ email: env.ADMIN_EMAIL }, { role: 'SUPER_ADMIN' }],
    });

    if (isSuperAdminExists) {
      logger.info('ℹ️ Super Admin / Admin already exists. Skipping admin seeding.');
      return;
    }

    const adminData = {
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: 'SUPER_ADMIN' as const,
      status: 'ACTIVE' as const,
      isEmailVerified: true,
    };

    await UserModel.create(adminData);
    logger.info(`✅ Super Admin seeded successfully! [Email: ${env.ADMIN_EMAIL}]`);
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to seed admin user');
  }
};
