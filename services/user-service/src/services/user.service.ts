import { User, IUser, DeliveryPerson } from '../models/user.model';
import { NotFoundError } from '@mallify/shared';
import { setCache, getCache, deleteCache } from '../config/redis';

export class UserService {
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
    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete (updateData as any).isEmailVerified;
    delete (updateData as any).googleId;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError('User');
    }

    // Clear cache
    await deleteCache(`user:${userId}`);

    return user;
  }

  async addAddress(userId: string, address: any): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // If this is the first address or marked as default, set it as default
    if (user.addresses.length === 0 || address.isDefault) {
      // Remove default from other addresses
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    user.addresses.push(address);
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

    // If setting as default, remove default from others
    if (addressData.isDefault) {
      user.addresses.forEach((addr: any) => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    Object.assign(address, addressData);
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
}

export default new UserService();
