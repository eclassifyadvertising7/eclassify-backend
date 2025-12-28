import roleRepository from '#repositories/roleRepository.js';

class RoleService {
  async getAllRoles() {
    try {
      const roles = await roleRepository.findAllRoles();

      return {
        success: true,
        message: 'Roles retrieved successfully',
        data: { roles }
      };
    } catch (error) {
      console.error('Error in getAllRoles:', error);
      return {
        success: false,
        message: 'Failed to retrieve roles',
        data: null
      };
    }
  }

  async getRoleById(roleId) {
    try {
      const role = await roleRepository.findRoleById(roleId);

      if (!role) {
        return {
          success: false,
          message: 'Role not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'Role retrieved successfully',
        data: { role }
      };
    } catch (error) {
      console.error('Error in getRoleById:', error);
      return {
        success: false,
        message: 'Failed to retrieve role',
        data: null
      };
    }
  }

  async createRole(roleData, createdBy) {
    try {
      if (!roleData.name || !roleData.slug) {
        return {
          success: false,
          message: 'Name and slug are required',
          data: null
        };
      }

      const existingSlug = await roleRepository.findBySlug(roleData.slug);
      if (existingSlug) {
        return {
          success: false,
          message: 'Role with this slug already exists',
          data: null
        };
      }

      const existingName = await roleRepository.findByName(roleData.name);
      if (existingName) {
        return {
          success: false,
          message: 'Role with this name already exists',
          data: null
        };
      }

      const role = await roleRepository.createRole(roleData, createdBy);

      return {
        success: true,
        message: 'Role created successfully',
        data: { role }
      };
    } catch (error) {
      console.error('Error in createRole:', error);
      return {
        success: false,
        message: 'Failed to create role',
        data: null
      };
    }
  }

  async updateRole(roleId, updateData, userId, userName) {
    try {
      const existingRole = await roleRepository.findRoleById(roleId);
      if (!existingRole) {
        return {
          success: false,
          message: 'Role not found',
          data: null
        };
      }

      if (existingRole.isSystemRole) {
        return {
          success: false,
          message: 'System roles cannot be modified',
          data: null
        };
      }

      if (updateData.slug && updateData.slug !== existingRole.slug) {
        const slugExists = await roleRepository.findBySlug(updateData.slug);
        if (slugExists) {
          return {
            success: false,
            message: 'Role with this slug already exists',
            data: null
          };
        }
      }

      if (updateData.name && updateData.name !== existingRole.name) {
        const nameExists = await roleRepository.findByName(updateData.name);
        if (nameExists) {
          return {
            success: false,
            message: 'Role with this name already exists',
            data: null
          };
        }
      }

      const role = await roleRepository.updateRole(roleId, updateData, userId, userName);

      return {
        success: true,
        message: 'Role updated successfully',
        data: { role }
      };
    } catch (error) {
      console.error('Error in updateRole:', error);
      return {
        success: false,
        message: 'Failed to update role',
        data: null
      };
    }
  }

  async toggleRoleStatus(roleId, isActive, userId, userName) {
    try {
      const existingRole = await roleRepository.findRoleById(roleId);
      if (!existingRole) {
        return {
          success: false,
          message: 'Role not found',
          data: null
        };
      }

      if (existingRole.isSystemRole) {
        return {
          success: false,
          message: 'System roles cannot be deactivated',
          data: null
        };
      }

      const role = await roleRepository.toggleRoleStatus(roleId, isActive, userId, userName);

      return {
        success: true,
        message: `Role ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { role }
      };
    } catch (error) {
      console.error('Error in toggleRoleStatus:', error);
      return {
        success: false,
        message: 'Failed to update role status',
        data: null
      };
    }
  }

  async getUsersByRole(roleId, { page = 1, limit = 20, search = '', status = null }) {
    try {
      const role = await roleRepository.findRoleById(roleId);
      if (!role) {
        return {
          success: false,
          message: 'Role not found',
          data: null
        };
      }

      const result = await roleRepository.findUsersByRole(roleId, { page, limit, search, status });

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          role: {
            id: role.id,
            name: role.name,
            slug: role.slug
          },
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
      console.error('Error in getUsersByRole:', error);
      return {
        success: false,
        message: 'Failed to retrieve users',
        data: null
      };
    }
  }
}

export default new RoleService();
