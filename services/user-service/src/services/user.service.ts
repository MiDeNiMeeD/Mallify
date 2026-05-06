import mongoose from 'mongoose';
import { User, IUser, DeliveryPerson } from '../models/user.model';
import { NotFoundError, BadRequestError, UserRole } from '@mallify/shared';
import { setCache, getCache, deleteCache } from '../config/redis';

export class UserService {
  async listUsers(filters: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<IUser[]> {
    const query: Record<string, any> = {};

    if (filters.search) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    if (filters.role && filters.role !== 'all') {
      query.role = filters.role;
    }

    if (filters.status && filters.status !== 'all') {
      query.isActive = filters.status === 'active';
    }

    const page = filters.page && filters.page > 0 ? filters.page : undefined;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : undefined;

    let cursor = User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    if (page && limit) {
      cursor = cursor.skip((page - 1) * limit).limit(limit);
    }

    const users = await cursor;
    return users;
  }

  async updateUserById(userId: string, updateData: Partial<IUser> & { status?: string }): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (updateData.status) {
      if (updateData.status !== 'active' && updateData.status !== 'suspended') {
        throw new BadRequestError('Invalid status value');
      }
      user.isActive = updateData.status === 'active';
    }

    if (updateData.name !== undefined) {
      user.name = String(updateData.name).trim();
    }

    if (updateData.email !== undefined) {
      user.email = String(updateData.email).trim().toLowerCase();
    }

    if (updateData.phone !== undefined) {
      user.phone = String(updateData.phone).trim();
    }

    if (updateData.role !== undefined) {
      if (!Object.values(UserRole).includes(updateData.role as UserRole)) {
        throw new BadRequestError('Invalid role value');
      }
      user.role = updateData.role as UserRole;
    }

    await user.save();
    await deleteCache(`user:${userId}`);

    return user;
  }

  async deleteUserById(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    await deleteCache(`user:${userId}`);
    await User.findByIdAndDelete(userId);
  }
  async getBuyerBasicById(userId: string): Promise<{ _id: string; name: string; email: string; phone: string }> {
    const user = await User.findById(userId).select('_id name email phone role isActive').lean();
    if (!user || !user.isActive || user.role !== UserRole.CLIENT) {
      throw new NotFoundError('User');
    }

    return {
      _id: String(user._id),
      name: String(user.name || '').trim(),
      email: String(user.email || '').trim(),
      phone: String(user.phone || '').trim(),
    };
  }

  async getUserById(userId: string): Promise<IUser> {
    // Try to get from cache first
    const cachedUser = await getCache(`user:${userId}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Cache user data for 1 hour
    await setCache(`user:${userId}`, user.toObject(), 3600);

    return user;
  }

  async getUserByEmail(email: string): Promise<IUser> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Only allow profile-editable fields from client profile screens.
    const editableFields = [
      'name',
      'nickname',
      'phone',
      'city',
      'gender',
      'dateOfBirth',
      'profileImage',
    ] as const;

    editableFields.forEach((field) => {
      const value = (updateData as any)[field];
      if (value === undefined) {
        return;
      }

      if (field === 'dateOfBirth') {
        const parsedDate = value instanceof Date ? value : new Date(String(value));
        if (!Number.isNaN(parsedDate.getTime())) {
          (user as any)[field] = parsedDate;
        }
        return;
      }

      (user as any)[field] = value;
    });

    await user.save();

    // Clear cache
    await deleteCache(`user:${userId}`);

    return user;
  }

  async addAddress(userId: string, address: any): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const normalizedAddress = { ...address };
    const addressName = String(
      normalizedAddress.name || normalizedAddress.label || normalizedAddress.type || ''
    ).trim();
    if (addressName) {
      normalizedAddress.name = addressName;
      normalizedAddress.label = addressName;
      normalizedAddress.type = addressName;
    }

    // If this is the first address or marked as default, set it as default
    if (user.addresses.length === 0 || normalizedAddress.isDefault) {
      // Remove default from other addresses
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
      normalizedAddress.isDefault = true;
    }

    user.addresses.push(normalizedAddress);
    await user.save();

    // Clear cache
    await deleteCache(`user:${userId}`);

    return user;
  }

  async updateAddress(userId: string, addressId: string, addressData: any): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const address = (user.addresses as any).id(addressId);
    if (!address) {
      throw new NotFoundError('Address');
    }

    const normalizedAddressData = { ...addressData };
    const addressName = String(
      normalizedAddressData.name || normalizedAddressData.label || normalizedAddressData.type || ''
    ).trim();
    if (addressName) {
      normalizedAddressData.name = addressName;
      normalizedAddressData.label = addressName;
      normalizedAddressData.type = addressName;
    }

    // If setting as default, remove default from others
    if (normalizedAddressData.isDefault) {
      user.addresses.forEach((addr: any) => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    Object.assign(address, normalizedAddressData);
    await user.save();

    // Clear cache
    await deleteCache(`user:${userId}`);

    return user;
  }

  async deleteAddress(userId: string, addressId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const address = (user.addresses as any).id(addressId);
    if (!address) {
      throw new NotFoundError('Address');
    }

    (user.addresses as any).pull(addressId);
    await user.save();

    // Clear cache
    await deleteCache(`user:${userId}`);

    return user;
  }

  async deactivateAccount(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    user.isActive = false;
    await user.save();

    // Clear cache
    await deleteCache(`user:${userId}`);
  }

  async reactivateAccount(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    user.isActive = true;
    await user.save();

    // Clear cache
    await deleteCache(`user:${userId}`);
  }

  async updateDeliveryPersonApplication(
    userId: string,
    status: 'approved' | 'rejected'
  ): Promise<IUser> {
    const user = await DeliveryPerson.findById(userId);
    if (!user) {
      throw new NotFoundError('Delivery person');
    }

    user.applicationStatus = status;
    await user.save();

    // Clear cache
    await deleteCache(`user:${userId}`);

    return user;
  }

  async uploadDocument(
    userId: string,
    documentType: 'driverLicense' | 'vehicleRegistration' | 'insurance',
    documentUrl: string
  ): Promise<IUser> {
    const user = await DeliveryPerson.findById(userId);
    if (!user) {
      throw new NotFoundError('Delivery person');
    }

    user.documents[documentType] = documentUrl;
    await user.save();

    // Clear cache
    await deleteCache(`user:${userId}`);

    return user;
  }

  async deleteUserByEmail(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError('User');
    }

    // Clear cache
    await deleteCache(`user:${user._id}`);

    // Delete the user
    await User.findByIdAndDelete(user._id);
  }

  async addBoutiqueToBoutiqueOwner(userId: string, boutiqueId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role !== 'boutique_owner') {
      throw new BadRequestError('User is not a boutique owner');
    }

    // Add boutique to the user's boutiqueList if not already present
    const boutiqueOwner = user as any;
    if (!boutiqueOwner.boutiqueList) {
      boutiqueOwner.boutiqueList = [];
    }

    const boutiqueObjectId = new mongoose.Types.ObjectId(boutiqueId);
    if (!boutiqueOwner.boutiqueList.some((id: any) => id.toString() === boutiqueId)) {
      boutiqueOwner.boutiqueList.push(boutiqueObjectId);
      await user.save();
    }

    // Clear cache
    await deleteCache(`user:${userId}`);

    return user;
  }
}

export default new UserService();
