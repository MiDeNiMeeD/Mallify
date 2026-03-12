import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Mallify <noreply@mallify.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendOTPEmail(email: string, otp: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            text-align: center;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            margin: 20px 0;
            letter-spacing: 5px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Mallify Email Verification</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up to become a boutique owner on Mallify!</p>
            <p>Please use the following OTP code to verify your email address:</p>
            <div class="otp-code">${otp}</div>
            <p>This code is valid for 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mallify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Mallify Email Verification
      
      Thank you for signing up to become a boutique owner on Mallify!
      
      Your OTP code is: ${otp}
      
      This code is valid for 10 minutes.
      
      If you didn't request this code, please ignore this email.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Mallify - Verify Your Email Address',
      html,
      text,
    });
  }

  async sendApprovalEmail(email: string, boutiqueName: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #10B981;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .success-box {
            background-color: #D1FAE5;
            border-left: 4px solid #10B981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #10B981;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
          }
          .celebration {
            font-size: 48px;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <div class="celebration">✨ 🎊 ✨</div>
            <h2>Your Boutique Application Has Been Approved!</h2>
            <p>Dear ${boutiqueName} Owner,</p>
            <p>We are excited to inform you that your boutique application has been approved! Welcome to the Mallify family!</p>
            
            <div class="success-box">
              <strong>✅ What's Next?</strong>
              <ul style="margin: 10px 0;">
                <li>Your boutique is now active on Mallify</li>
                <li>Start adding your products to your store</li>
                <li>Set up your payment and shipping options</li>
                <li>Begin reaching thousands of customers</li>
              </ul>
            </div>
            
            <p>You can now log in to your boutique dashboard using the credentials you provided during registration.</p>
            
            <p>Our team is here to support you every step of the way. If you have any questions or need assistance, please don't hesitate to reach out.</p>
            
            <p>We look forward to seeing your boutique thrive on Mallify!</p>
            
            <p>Best regards,<br>The Mallify Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mallify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Mallify - Boutique Application Approved!
      
      Congratulations!
      
      Dear ${boutiqueName} Owner,
      
      We are excited to inform you that your boutique application has been approved! Welcome to the Mallify family!
      
      What's Next?
      - Your boutique is now active on Mallify
      - Start adding your products to your store
      - Set up your payment and shipping options
      - Begin reaching thousands of customers
      
      You can now log in to your boutique dashboard using the credentials you provided during registration.
      
      Our team is here to support you every step of the way. If you have any questions or need assistance, please don't hesitate to reach out.
      
      We look forward to seeing your boutique thrive on Mallify!
      
      Best regards,
      The Mallify Team
    `;

    return this.sendEmail({
      to: email,
      subject: '🎉 Congratulations! Your Boutique Has Been Approved - Mallify',
      html,
      text,
    });
  }

  async sendRejectionEmail(email: string, boutiqueName: string, reason: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #DC2626;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .reason-box {
            background-color: #FEE2E2;
            border-left: 4px solid #DC2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Boutique Application - Decision</h1>
          </div>
          <div class="content">
            <h2>Application Status Update</h2>
            <p>Dear ${boutiqueName} Owner,</p>
            <p>Thank you for your interest in joining Mallify as a boutique partner.</p>
            <p>After careful review of your application, we regret to inform you that we are unable to approve your boutique application at this time.</p>
            
            <div class="reason-box">
              <strong>Reason for Rejection:</strong>
              <p>${reason}</p>
            </div>
            
            <p>We appreciate your interest in Mallify and encourage you to address the concerns mentioned above. You are welcome to submit a new application in the future once these issues have been resolved.</p>
            
            <p>If you have any questions or would like more information, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Mallify Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mallify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Mallify - Boutique Application Decision
      
      Dear ${boutiqueName} Owner,
      
      Thank you for your interest in joining Mallify as a boutique partner.
      
      After careful review of your application, we regret to inform you that we are unable to approve your boutique application at this time.
      
      Reason for Rejection:
      ${reason}
      
      We appreciate your interest in Mallify and encourage you to address the concerns mentioned above. You are welcome to submit a new application in the future once these issues have been resolved.
      
      If you have any questions or would like more information, please don't hesitate to contact our support team.
      
      Best regards,
      The Mallify Team
    `;

    return this.sendEmail({
      to: email,
      subject: 'Mallify - Boutique Application Decision',
      html,
      text,
    });
  }
}

export default new EmailService();
