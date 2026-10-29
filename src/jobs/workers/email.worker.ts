// import { Worker, Job } from 'bullmq';
// import nodemailer from 'nodemailer';
// import { logger } from '@/utils/logger';
// import { env } from '@/config/env';
// import { EMAIL_QUEUE_NAME, IEmailJobData } from '../queues/email.queue';
// import { redisConfig } from '@/config/redis';
//
// // Create a Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   host: env.SMTP_HOST,
//   port: env.SMTP_PORT,
//   secure: env.SMTP_PORT === 465, // true for 465, false for other ports
//   auth: {
//     user: env.SMTP_USER,
//     pass: env.SMTP_PASS,
//   },
// });
//
// export const emailWorker = new Worker<IEmailJobData>(
//   EMAIL_QUEUE_NAME,
//   async (job: Job<IEmailJobData>) => {
//     logger.info(`Processing Email Job [${job.id}] to: ${job.data.to}`);
//
//     const mailOptions = {
//       from: env.SMTP_FROM,
//       to: job.data.to,
//       subject: job.data.subject,
//       html: job.data.body, // Assuming body contains HTML
//     };
//
//     // Send email using Nodemailer
//     const info = await transporter.sendMail(mailOptions);
//
//     logger.info(`Email successfully sent to: ${job.data.to}. Message ID: ${info.messageId}`);
//   },
//   { connection: redisConfig },
// );
//
// emailWorker.on('completed', (job) => {
//   logger.info(`Email Job [${job.id}] completed successfully`);
// });
//
// emailWorker.on('failed', (job, err) => {
//   logger.error(`Email Job [${job?.id}] failed: ${err.message}`);
// });

export {};
