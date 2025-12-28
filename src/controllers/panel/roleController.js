import roleService from '#services/roleService.js';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '#utils/responseFormatter.js';

class RoleController {
  static async getAllRoles(req, res) {
    try {
      const result = await roleService.getAllRoles();

      if (!result.success) {
        return errorResponse(res, result.message, 500);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in getAllRoles:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  static async getRoleById(req, res) {
    try {
      const { roleId } = req.params;

      const result = await roleService.getRoleById(roleId);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in getRoleById:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  static async createRole(req, res) {
    try {
      const roleData = req.body;
      const createdBy = req.user.userId;

      const result = await roleService.createRole(roleData, createdBy);

      if (!result.success) {
        return validationErrorResponse(res, [{ field: 'general', message: result.message }]);
      }

      return successResponse(res, result.data, result.message, 201);
    } catch (error) {
      console.error('Error in createRole:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  static async updateRole(req, res) {
    try {
      const { roleId } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;
      const userName = req.user.email;

      const result = await roleService.updateRole(roleId, updateData, userId, userName);

      if (!result.success) {
        return validationErrorResponse(res, [{ field: 'general', message: result.message }]);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in updateRole:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  static async toggleRoleStatus(req, res) {
    try {
      const { roleId } = req.params;
      const { isActive } = req.body;
      const userId = req.user.userId;
      const userName = req.user.email;

      if (typeof isActive !== 'boolean') {
        return validationErrorResponse(res, [{ field: 'isActive', message: 'isActive must be a boolean' }]);
      }

      const result = await roleService.toggleRoleStatus(roleId, isActive, userId, userName);

      if (!result.success) {
        return validationErrorResponse(res, [{ field: 'general', message: result.message }]);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in toggleRoleStatus:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  static async getUsersByRole(req, res) {
    try {
      const { roleId } = req.params;
      const { page = 1, limit = 20, search = '', status } = req.query;

      const result = await roleService.getUsersByRole(roleId, {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status
      });

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in getUsersByRole:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }
}

export default RoleController;
