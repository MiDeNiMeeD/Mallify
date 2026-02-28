import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
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
}

interface LoginResponse {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
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
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create user based on role
    let user: IUser;
    
    switch (data.role) {
      case UserRole.CLIENT:
        user = await Client.create(data);
        break;
      case UserRole.BOUTIQUE_OWNER:
        user = await BoutiqueOwner.create(data);
        break;
      case UserRole.DELIVERY_PERSON:
        user = await DeliveryPerson.create(data);
        break;
      default:
        user = await User.create(data);
    }

    // Generate and send OTP for email verification
    await this.sendVerificationOTP(user.email);

    return {
      user: this.sanitizeUser(user),
      message: 'Registration successful. Please verify your email with the OTP sent.',
    };
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
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('Email already verified');
    }

    // Generate OTP
    const code = this.generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTPs for this email
    await OTPCode.deleteMany({ email, type: 'verification' });

    // Save new OTP
    await OTPCode.create({
      email,
      code,
      type: 'verification',
      expiresAt,
    });

    // Send email
    await sendEmail({
      to: email,
      subject: 'Verify your email - Mallify',
      text: `Your verification code is: ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
    });
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    const otpDoc = await OTPCode.findOne({
      email,
      code,
      type: 'verification',
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      throw new BadRequestError('Invalid or expired OTP code');
    }

    // Update user
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User');
    }

    user.isEmailVerified = true;
    await user.save();

    // Delete OTP
    await otpDoc.deleteOne();

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
