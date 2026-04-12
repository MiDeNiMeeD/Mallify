import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: any[];
}

const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
const smtpSecure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === 'true'
  : smtpPort === 465;

const isEmailConfigured = (): boolean => Boolean(smtpUser && smtpPassword);

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

export const initializeEmailTransport = async (): Promise<void> => {
  if (!isEmailConfigured()) {
    console.warn('[EMAIL] SMTP credentials missing (SMTP_USER/SMTP_PASSWORD or EMAIL_USER/EMAIL_PASSWORD).');
    return;
  }

  try {
    await transporter.verify();
    console.log(`[EMAIL] SMTP connected (${smtpHost}:${smtpPort}) as ${smtpUser}`);
  } catch (error) {
    console.error('[EMAIL] SMTP verification failed:', error);
  }
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // In development we allow startup without SMTP and log OTP to console.
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP is not configured in production environment.');
    }

    console.log(`[EMAIL SKIPPED - No SMTP config] To: ${options.to}, Subject: ${options.subject}`);
    if (options.attachments && options.attachments.length) {
      console.log(`[EMAIL SKIPPED - Attachments]: ${options.attachments.map(a => a.filename || a.path || a.cid).join(', ')}`);
    }
    if (options.text.includes('verification code') || options.text.includes('OTP')) {
      const codeMatch = options.text.match(/\b\d{6}\b/);
      if (codeMatch) {
        console.log(`[OTP CODE]: ${codeMatch[0]}`);
      }
    }
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Mallify'}" <${process.env.FROM_EMAIL || smtpUser}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
      attachments: options.attachments || [],
    });
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
