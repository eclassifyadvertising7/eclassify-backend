import db from '#models/index.js';
import { Op } from 'sequelize';

const { User, UserProfile, Role, UserSubscription } = db;

class UserManagementRepository {
  // List users with role filter
  async findUsers({ roleSlug, page = 1, limit = 20, search = '', status = null, startDate = null, endDate = null }) {
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }
    
    // Search by name, email, or mobile
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } }
      ];
    }

    // Date range filter (registration date)
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        whereClause.createdAt[Op.lt] = endDateTime;
      }
    }

    const roleWhere = roleSlug === 'user' 
      ? { slug: 'user' }
      : { slug: { [Op.notIn]: ['super_admin', 'user'] } };

    const { rows, count } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'role',
          where: roleWhere,
          attributes: ['id', 'name', 'slug']
        }
      ],
      attributes: ['id', 'fullName', 'mobile', 'email', 'isActive', 'kycStatus', 'isVerified', 'status', ['created_at', 'createdAt']],
      offset,
      limit,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    return { users: rows, total: count };
  }

  // Get user by ID with full details
  async findUserById(userId) {
    return await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: UserProfile,
          as: 'profile',
          attributes: ['id', 'dob', 'gender', 'about', 'businessName', 'gstin', 'aadharNumber', 'panNumber', 
                      'addressLine1', 'addressLine2', 'cityId', 'cityName', 'stateId', 'stateName', 'country', 'pincode',
                      'profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
        }
      ]
    });
  }

  // Create new user
  async createUser(userData, transaction = null) {
    return await User.create(userData, { transaction });
  }

  // Update user
  async updateUser(userId, updateData, transaction = null) {
    const user = await User.findByPk(userId, { transaction });
    if (!user) return null;
    
    return await user.update(updateData, { transaction });
  }

  // Toggle user status
  async toggleUserStatus(userId, isActive) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    
    user.isActive = isActive;
    user.status = isActive ? 'active' : 'suspended';
    await user.save();
    
    return user;
  }

  // Delete user (soft delete)
  async deleteUser(userId, deletedBy) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    
    await user.destroy({ userId: deletedBy });
    return user;
  }

  // Update KYC status
  async updateKycStatus(userId, kycStatus) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    
    user.kycStatus = kycStatus;
    
    // Auto-verify user when KYC is approved
    if (kycStatus === 'approved') {
      user.isVerified = true;
    }
    
    await user.save();
    
    return user;
  }

  // Make user verified
  async makeUserVerified(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    
    user.isVerified = true;
    await user.save();
    
    return user;
  }

  // Enable auto-approve for user
  async toggleAutoApprove(userId, isEnabled) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    
    user.isAutoApproveEnabled = isEnabled;
    await user.save();
    
    return user;
  }

  // Get user's active subscription (returns first one found - legacy method)
  async getUserActiveSubscription(userId) {
    return await UserSubscription.findOne({
      where: {
        userId,
        status: 'active',
        endsAt: { [Op.gt]: new Date() }
      },
      order: [['endsAt', 'DESC']]
    });
  }

  // Get user's active subscriptions (can have multiple, one per category)
  async getUserActiveSubscriptions(userId) {
    return await UserSubscription.findAll({
      where: {
        userId,
        status: 'active',
        endsAt: { [Op.gt]: new Date() }
      },
      order: [['endsAt', 'DESC']]
    });
  }

  // Check if email exists
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  // Check if mobile exists
  async findByMobile(mobile) {
    return await User.findOne({ where: { mobile } });
  }

  // Get user statistics
  async getUserStats() {
    const totalUsers = await User.count({
      include: [{
        model: Role,
        as: 'role',
        where: { slug: 'user' }
      }]
    });

    const activeUsers = await User.count({
      where: { isActive: true },
      include: [{
        model: Role,
        as: 'role',
        where: { slug: 'user' }
      }]
    });

    const verifiedUsers = await User.count({
      where: { isVerified: true },
      include: [{
        model: Role,
        as: 'role',
        where: { slug: 'user' }
      }]
    });

    const kycPending = await User.count({
      where: { kycStatus: 'pending' },
      include: [{
        model: Role,
        as: 'role',
        where: { slug: 'user' }
      }]
    });

    return { totalUsers, activeUsers, verifiedUsers, kycPending };
  }
}

export default new UserManagementRepository();
