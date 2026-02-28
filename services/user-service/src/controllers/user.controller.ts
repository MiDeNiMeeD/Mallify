import { Request, Response, NextFunction } from 'express';
import { asyncHandler, ResponseFormatter } from '@mallify/shared';
import userService from '../services/user.service';

export class UserController {
  getProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    const user = await userService.getUserById(userId);
    return ResponseFormatter.success(res, user, 'Profile retrieved successfully');
  });

  getUserById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    return ResponseFormatter.success(res, user, 'User retrieved successfully');
  });

  updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    const user = await userService.updateProfile(userId, req.body);
    return ResponseFormatter.success(res, user, 'Profile updated successfully');
  });

  addAddress = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    const user = await userService.addAddress(userId, req.body);
    return ResponseFormatter.success(res, user, 'Address added successfully');
  });

  updateAddress = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    const { addressId } = req.params;
    const user = await userService.updateAddress(userId, addressId, req.body);
    return ResponseFormatter.success(res, user, 'Address updated successfully');
  });

  deleteAddress = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    const { addressId } = req.params;
    const user = await userService.deleteAddress(userId, addressId);
    return ResponseFormatter.success(res, user, 'Address deleted successfully');
  });

  deactivateAccount = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    await userService.deactivateAccount(userId);
    return ResponseFormatter.success(res, null, 'Account deactivated successfully');
  });

  updateApplicationStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    const { status } = req.body;
    const user = await userService.updateDeliveryPersonApplication(userId, status);
    return ResponseFormatter.success(res, user, 'Application status updated successfully');
  });
}

export default new UserController();
