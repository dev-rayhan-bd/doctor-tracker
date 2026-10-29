// import { Queue } from 'bullmq';
// import { redisConfig } from '@/config/redis';
//
// export interface IEmailJobData {
//   to: string;
//   subject: string;
//   body: string;
//   template?: string;
// }
//
// export const EMAIL_QUEUE_NAME = 'email-queue';
//
// export const emailQueue = new Queue<IEmailJobData>(EMAIL_QUEUE_NAME, {
//   connection: redisConfig,
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: {
//       type: 'exponential',
//       delay: 1000,
//     },
//     removeOnComplete: true,
//   },
// });

export {};
