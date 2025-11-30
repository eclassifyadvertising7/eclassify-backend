import userManagementRepository from '#repositories/userManagementRepository.js';
import bcrypt from 'bcrypt';
import db from '#models/index.js';

const { Role } = db;

class UserManagementService {
  // List users (external users with 'user' role)
  async listExternalUsers({ page = 1, limit = 20, search = '', status = null, startDate = null, endDate = null }) {
    try {
      const result = await userManagementRepository.findUsers({
        roleSlug: 'user',
        page,
        limit,
        search,
        status,
        startDate,
        endDate
      });

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: result.users,
          pagination: {
            total: result.total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(result.total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Error listing external users:', error);
      return {
        success: false,
        message: 'Failed to retrieve users',
        data: null
      };
    }
  }

  // List internal users (all roles except super_admin and user)
  async listInternalUsers({ page = 1, limit = 20, search = '', status = null, startDate = null, endDate = null }) {
    try {
      const result = await userManagementRepository.findUsers({
        roleSlug: 'internal',
        page,
        limit,
        search,
        status,
        startDate,
        endDate
      });

      return {
        success: true,
        message: 'Internal users retrieved successfully',
        data: {
          users: result.users,
          pagination: {
            total: result.total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(result.total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Error listing internal users:', error);
      return {
        success: false,
        message: 'Failed to retrieve internal users',
        data: null
      };
    }
  }

  // Get user details by ID
  async getUserDetails(userId) {
    try {
      const user = await userManagementRepository.findUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }

      // Get active subscription if exists
      const activeSubscription = await userManagementRepository.getUserActiveSubscription(userId);

      return {
        success: true,
        message: 'User details retrieved successfully',
        data: {
          user,
          activeSubscription
        }
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      return {
        success: false,
        message: 'Failed to retrieve user details',
        data: null
      };
    }
  }

  // Create new user
  async createUser(userData, createdBy) {
    try {
      // Validate required fields
      if (!userData.fullName || !userData.mobile || !userData.password) {
        return {
          success: false,
          message: 'Full name, mobile, and password are required',
          data: null
        };
      }

      // Validate role
      if (!userData.roleSlug) {
        return {
          success: false,
          message: 'Role is required',
          data: null
        };
      }

      // Prevent creating super_admin or user roles
      if (userData.roleSlug === 'super_admin' || userData.roleSlug === 'user') {
        return {
          success: false,
          message: 'Cannot create users with super_admin or user role',
          data: null
        };
      }

      // Check if role exists
      const role = await Role.findOne({ where: { slug: userData.roleSlug } });
      if (!role) {
        return {
          success: false,
          message: 'Invalid role specified',
          data: null
        };
      }

      // Check if mobile already exists
      const existingMobile = await userManagementRepository.findByMobile(userData.mobile);
      if (existingMobile) {
        return {
          success: false,
          message: 'Mobile number already registered',
          data: null
        };
      }

      // Check if email already exists (if provided)
      if (userData.email) {
        const existingEmail = await userManagementRepository.findByEmail(userData.email);
        if (existingEmail) {
          return {
            success: false,
            message: 'Email already registered',
            data: null
          };
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create user
      const newUser = await userManagementRepository.createUser({
        fullName: userData.fullName,
        countryCode: userData.countryCode || '+91',
        mobile: userData.mobile,
        email: userData.email || null,
        passwordHash,
        roleId: role.id,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        isPhoneVerified: userData.isPhoneVerified || false,
        isEmailVerified: userData.isEmailVerified || false,
        createdBy
      });

      return {
        success: true,
        message: 'User created successfully',
        data: { userId: newUser.id }
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: 'Failed to create user',
        data: null
      };
    }
  }

  // Toggle user status (activate/deactivate)
  async toggleUserStatus(userId, isActive) {
    try {
      const user = await userManagementRepository.toggleUserStatus(userId, isActive);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }

      return {
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { userId: user.id, isActive: user.isActive, status: user.status }
      };
    } catch (error) {
      console.error('Error toggling user status:', error);
      return {
        success: false,
        message: 'Failed to update user status',
        data: null
      };
    }
  }

  // Delete user (soft delete)
  async deleteUser(userId, deletedBy) {
    try {
      // Check if user exists
      const user = await userManagementRepository.findUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }

      // Prevent deleting super_admin
      if (user.role?.slug === 'super_admin') {
        return {
          success: false,
          message: 'Cannot delete super admin user',
          data: null
        };
      }

      await userManagementRepository.deleteUser(userId, deletedBy);

      return {
        success: true,
        message: 'User deleted successfully',
        data: { userId }
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: 'Failed to delete user',
        data: null
      };
    }
  }

  // Update KYC status
  async updateKycStatus(userId, kycStatus) {
    try {
      if (!['pending', 'approved', 'rejected'].includes(kycStatus)) {
        return {
          success: false,
          message: 'Invalid KYC status. Must be pending, approved, or rejected',
          data: null
        };
      }

      const user = await userManagementRepository.updateKycStatus(userId, kycStatus);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'KYC status updated successfully',
        data: { userId: user.id, kycStatus: user.kycStatus }
      };
    } catch (error) {
      console.error('Error updating KYC status:', error);
      return {
        success: false,
        message: 'Failed to update KYC status',
        data: null
      };
    }
  }

  // Make user verified
  async makeUserVerified(userId) {
    try {
      const user = await userManagementRepository.makeUserVerified(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'User verified successfully',
        data: { userId: user.id, isVerified: user.isVerified }
      };
    } catch (error) {
      console.error('Error verifying user:', error);
      return {
        success: false,
        message: 'Failed to verify user',
        data: null
      };
    }
  }

  // Toggle auto-approve for user listings
  async toggleAutoApprove(userId, isEnabled) {
    try {
      const user = await userManagementRepository.toggleAutoApprove(userId, isEnabled);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }

      return {
        success: true,
        message: `Auto-approve ${isEnabled ? 'enabled' : 'disabled'} successfully`,
        data: { userId: user.id, isAutoApproveEnabled: user.isAutoApproveEnabled }
      };
    } catch (error) {
      console.error('Error toggling auto-approve:', error);
      return {
        success: false,
        message: 'Failed to update auto-approve setting',
        data: null
      };
    }
  }

  // Get user statistics
  async getUserStatistics() {
    try {
      const stats = await userManagementRepository.getUserStats();

      return {
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return {
        success: false,
        message: 'Failed to retrieve user statistics',
        data: null
      };
    }
  }
}

export default new UserManagementService();
