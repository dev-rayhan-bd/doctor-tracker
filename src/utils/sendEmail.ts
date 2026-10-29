import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { logger } from './logger';

export interface ISendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendEmail = async (options: ISendEmailOptions): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
  } catch (error) {
    logger.error({ err: error, to: options.to }, 'Failed to send email');
  }
};
