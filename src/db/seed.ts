import { connectDB, disconnectDB } from '@/config/db';
import { seedAllData } from './seedAll';
import { logger } from '@/utils/logger';

async function runSeed() {
  try {
    await connectDB();
    await seedAllData();
    await disconnectDB();
    logger.info('🚀 Seeding script completed successfully.');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, '❌ Seeding script failed');
    process.exit(1);
  }
}

runSeed();
