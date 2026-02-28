import { Request, Response, NextFunction } from 'express';
import { asyncHandler, ResponseFormatter } from '@mallify/shared';
import authService from '../services/auth.service';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.register(req.body);
    return ResponseFormatter.created(res, result, result.message);
  });

  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return ResponseFormatter.success(res, result, 'Login successful');
  });

  googleCallback = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // This will be called by Passport after Google authentication
    const user = req.user as any;
    const result = await authService.googleLogin(
      user.googleId,
      user.email,
      user.name,
      user.profileImage
    );
    return ResponseFormatter.success(res, result, 'Google login successful');
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    return ResponseFormatter.success(res, result, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return ResponseFormatter.success(res, null, 'Logged out successfully');
  });

  sendVerificationOTP = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;
    await authService.sendVerificationOTP(email);
    return ResponseFormatter.success(res, null, 'Verification OTP sent to email');
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, code } = req.body;
    await authService.verifyEmail(email, code);
    return ResponseFormatter.success(res, null, 'Email verified successfully');
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;
    await authService.sendPasswordResetOTP(email);
    return ResponseFormatter.success(res, null, 'Password reset OTP sent to email');
  });

  resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, code, newPassword } = req.body;
    await authService.resetPassword(email, code, newPassword);
    return ResponseFormatter.success(res, null, 'Password reset successfully');
  });

  changePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(userId, currentPassword, newPassword);
    return ResponseFormatter.success(res, null, 'Password changed successfully');
  });
}

export default new AuthController();
