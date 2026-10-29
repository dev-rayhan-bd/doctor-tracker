import { connectDB, disconnectDB } from '@/config/db';
import { seedAdmin } from './seedAdmin';
import { logger } from '@/utils/logger';

async function runSeed() {
  try {
    await connectDB();
    await seedAdmin();
    await disconnectDB();
    logger.info('🚀 Seeding script completed.');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, '❌ Seeding script failed');
    process.exit(1);
  }
}

runSeed();
