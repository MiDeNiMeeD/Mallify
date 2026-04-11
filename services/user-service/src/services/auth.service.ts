import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { User, IUser, Client, BoutiqueOwner, DeliveryPerson } from '../models/user.model';
import { OTPCode } from '../models/otp.model';
import { RefreshToken } from '../models/refreshToken.model';
import { 
  AuthenticationError, 
  ConflictError, 
  NotFoundError, 
  BadRequestError,
  UserRole 
} from '@mallify/shared';
import { sendEmail } from '../utils/email';
import { setCache, deleteCache } from '../config/redis';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  skipEmailVerification?: boolean; // For service-to-service calls
}

interface LoginResponse {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private async createUserByRole(data: RegisterData & { isEmailVerified?: boolean }): Promise<IUser> {
    switch (data.role) {
      case UserRole.CLIENT:
        return Client.create(data);
      case UserRole.BOUTIQUE_OWNER:
        return BoutiqueOwner.create(data);
      case UserRole.DELIVERY_PERSON:
        return DeliveryPerson.create(data);
      default:
        return User.create(data);
    }
  }

  private generateAccessToken(user: IUser): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET not configured');

    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
  }

  private generateRefreshToken(): string {
    return uuidv4();
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await RefreshToken.create({
      userId,
      token,
      expiresAt,
    });
  }

  private generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private sanitizeUser(user: IUser): Partial<IUser> {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  async register(data: RegisterData): Promise<{ user: Partial<IUser>; message: string }> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const registerData: RegisterData = {
      ...data,
      email: normalizedEmail,
    };

    // Skip email verification if requested (for service-to-service calls)
    if (registerData.skipEmailVerification) {
      const user = await this.createUserByRole({
        ...registerData,
        isEmailVerified: true,
      });

      user.isEmailVerified = true;
      await user.save();
      return {
        user: this.sanitizeUser(user),
        message: 'Registration successful.',
      };
    }

    // Store pending registration + send OTP. User is created only after OTP verification.
    try {
      const code = this.generateOTPCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await OTPCode.deleteMany({ email: normalizedEmail, type: 'verification' });
      await OTPCode.create({
        email: normalizedEmail,
        code,
        type: 'verification',
        expiresAt,
        pendingRegistration: {
          name: registerData.name,
          password: registerData.password,
          phone: registerData.phone,
          role: registerData.role,
        },
      });

      await sendEmail({
        to: normalizedEmail,
        subject: 'Verify your email - Mallify',
        text: `Your verification code is: ${code}. It expires in 10 minutes.`,
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
      });

      return {
        user: {
          name: registerData.name,
          email: normalizedEmail,
          role: registerData.role,
          isEmailVerified: false,
        } as Partial<IUser>,
        message: 'Registration successful. Please verify your email with the OTP sent.',
      };
    } catch (emailError: any) {
      // If email sending fails, remove pending OTP payload so no stale records remain.
      await OTPCode.deleteMany({ email: normalizedEmail, type: 'verification' });
      throw emailError;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // If user is a boutique owner, verify their application is approved
    if (user.role === 'boutique_owner') {
      try {
        const boutiqueServiceUrl = process.env.BOUTIQUE_SERVICE_URL || 'http://localhost:3003';
        const response = await axios.get(`${boutiqueServiceUrl}/api/boutiques/applications`, {
          params: { email: user.email, limit: 1 }
        });

        if (response.data.success && response.data.data.applications.length > 0) {
          const application = response.data.data.applications[0];
          
          if (application.status === 'pending') {
            throw new AuthenticationError('Your boutique application is pending review. You will be able to login once it is approved.');
          }
          
          if (application.status === 'rejected') {
            throw new AuthenticationError('Your boutique application has been rejected. Please contact support for more information.');
          }
          
          // Only 'approved' status can proceed to login
          if (application.status !== 'approved') {
            throw new AuthenticationError('Your boutique application is under review. Please wait for approval.');
          }
        } else {
          // No application found
          throw new AuthenticationError('No boutique application found for this account. Please submit an application first.');
        }
      } catch (error: any) {
        // If it's already an AuthenticationError, re-throw it
        if (error instanceof AuthenticationError) {
          throw error;
        }
        // If boutique service is down or other error, log it but allow login
        console.error('⚠️  Warning: Failed to verify boutique application status:', error.message);
        // In production, you might want to be more strict here
      }
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    // Save refresh token
    await this.saveRefreshToken(user._id.toString(), refreshToken);

    // Cache user data for 1 hour
    await setCache(`user:${user._id}`, this.sanitizeUser(user), 3600);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(googleId: string, email: string, name: string, profileImage?: string): Promise<LoginResponse> {
    // Find or create user
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.isEmailVerified = true;
        if (profileImage) user.profileImage = profileImage;
        await user.save();
      } else {
        // Create new client user
        user = await Client.create({
          name,
          email,
          googleId,
          profileImage,
          role: UserRole.CLIENT,
          isEmailVerified: true,
        });
      }
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    // Save refresh token
    await this.saveRefreshToken(user._id.toString(), refreshToken);

    // Cache user data
    await setCache(`user:${user._id}`, this.sanitizeUser(user), 3600);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDoc) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (tokenDoc.expiresAt < new Date()) {
      await tokenDoc.deleteOne();
      throw new AuthenticationError('Refresh token expired');
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  async sendVerificationOTP(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = (await User.findOne({ email: normalizedEmail })) as IUser | null;
    const existingPending = await OTPCode.findOne({
      email: normalizedEmail,
      type: 'verification',
    });

    if (!user && !existingPending) {
      throw new NotFoundError('User');
    }

    if (user && user.isEmailVerified) {
      throw new BadRequestError('Email already verified');
    }

    // Generate OTP
    const code = this.generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTPs for this email
    await OTPCode.deleteMany({ email: normalizedEmail, type: 'verification' });

    // Save new OTP
    await OTPCode.create({
      email: normalizedEmail,
      code,
      type: 'verification',
      expiresAt,
      pendingRegistration: existingPending?.pendingRegistration,
    });

    // Send email
    await sendEmail({
      to: normalizedEmail,
      subject: 'Verify your email - Mallify',
      text: `Your verification code is: ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
    });
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const otpDoc = await OTPCode.findOne({
      email: normalizedEmail,
      code,
      type: 'verification',
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      throw new BadRequestError('Invalid or expired OTP code');
    }

    // Create user at verification time if this is a pending registration.
    let user = (await User.findOne({ email: normalizedEmail })) as IUser | null;
    if (!user) {
      const pending = otpDoc.pendingRegistration;
      if (!pending?.name || !pending?.password || !pending?.role) {
        throw new NotFoundError('User');
      }

      user = await this.createUserByRole({
        name: pending.name,
        email: normalizedEmail,
        password: pending.password,
        phone: pending.phone,
        role: pending.role as UserRole,
        isEmailVerified: true,
      });
    }

    if (!user) {
      throw new NotFoundError('User');
    }

    user.isEmailVerified = true;
    await user.save();

    // Delete all verification OTP records for this email
    await OTPCode.deleteMany({ email: normalizedEmail, type: 'verification' });

    // Clear cache
    await deleteCache(`user:${user._id}`);
  }

  async sendPasswordResetOTP(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate OTP
    const code = this.generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTPs
    await OTPCode.deleteMany({ email, type: 'password_reset' });

    // Save new OTP
    await OTPCode.create({
      email,
      code,
      type: 'password_reset',
      expiresAt,
    });

    // Send email
    await sendEmail({
      to: email,
      subject: 'Reset your password - Mallify',
      text: `Your password reset code is: ${code}. It expires in 10 minutes.`,
      html: `<p>Your password reset code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
    });
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const otpDoc = await OTPCode.findOne({
      email,
      code,
      type: 'password_reset',
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      throw new BadRequestError('Invalid or expired OTP code');
    }

    // Update user password
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User');
    }

    user.password = newPassword;
    await user.save();

    // Delete OTP
    await otpDoc.deleteOne();

    // Delete all refresh tokens for this user
    await RefreshToken.deleteMany({ userId: user._id });

    // Clear cache
    await deleteCache(`user:${user._id}`);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete all refresh tokens for security
    await RefreshToken.deleteMany({ userId: user._id });

    // Clear cache
    await deleteCache(`user:${userId}`);
  }
}

export default new AuthService();
