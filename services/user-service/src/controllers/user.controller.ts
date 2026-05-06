import { Request, Response, NextFunction } from 'express';
import { asyncHandler, ResponseFormatter } from '@mallify/shared';
import userService from '../services/user.service';

export class UserController {
  getUsers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { search, role, status, page, limit } = req.query;

    const users = await userService.listUsers({
      search: typeof search === 'string' ? search : undefined,
      role: typeof role === 'string' ? role : undefined,
      status: typeof status === 'string' ? status : undefined,
      page: typeof page === 'string' ? Number(page) : undefined,
      limit: typeof limit === 'string' ? Number(limit) : undefined,
    });

    const normalizedUsers = users.map((user: any) => {
      const plainUser = typeof user?.toObject === 'function' ? user.toObject() : user;
      return {
        ...plainUser,
        status: plainUser?.isActive ? 'active' : 'suspended',
      };
    });

    return ResponseFormatter.success(res, normalizedUsers, 'Users retrieved successfully');
  });
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

  updateUserById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    const user = await userService.updateUserById(userId, req.body);
    return ResponseFormatter.updated(res, user, 'User updated successfully');
  });

  deleteUserById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    await userService.deleteUserById(userId);
    return ResponseFormatter.deleted(res, 'User deleted successfully');
  });

  getBuyerBasicById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    const buyer = await userService.getBuyerBasicById(userId);
    return ResponseFormatter.success(res, buyer, 'Buyer basic profile retrieved successfully');
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

  deleteUserByEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.params;
    await userService.deleteUserByEmail(email);
    return ResponseFormatter.success(res, null, 'User deleted successfully');
  });

  getUserByEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email);
    return ResponseFormatter.success(res, user, 'User retrieved successfully');
  });

  addBoutique = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    const { boutiqueId } = req.body;
    const user = await userService.addBoutiqueToBoutiqueOwner(userId, boutiqueId);
    return ResponseFormatter.success(res, user, 'Boutique added to user successfully');
  });
}

export default new UserController();
