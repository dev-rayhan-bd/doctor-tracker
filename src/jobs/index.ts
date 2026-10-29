// import { emailWorker } from './workers/email.worker';
// import { videoWorker } from './workers/video.worker';
// import { logger } from '@/utils/logger';
//
// export * from './queues/email.queue';
// export * from './queues/video.queue';
//
// export const initBackgroundJobs = (): void => {
//   logger.info('Initializing BullMQ Background Workers (Email & Video)...');
//   // Workers auto-start upon instantiation, listening for events
//   emailWorker.on('ready', () => logger.info('Email Worker is ready'));
//   videoWorker.on('ready', () => logger.info('Video Worker is ready'));
// };

export {};
