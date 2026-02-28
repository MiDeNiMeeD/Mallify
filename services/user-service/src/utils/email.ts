import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Skip email sending if SMTP credentials are not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log(`[EMAIL SKIPPED - No SMTP config] To: ${options.to}, Subject: ${options.subject}`);
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
      from: `"${process.env.FROM_NAME || 'Mallify'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
