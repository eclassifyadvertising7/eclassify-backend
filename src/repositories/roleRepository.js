import models from '#models/index.js';
import { Op } from 'sequelize';

const { Role, User } = models;

class RoleRepository {
  async findAllRoles() {
    return await Role.findAll({
      attributes: ['id', 'name', 'slug', 'description', 'priority', ['is_system_role', 'isSystemRole'], ['is_active', 'isActive']],
      order: [['priority', 'DESC'], ['name', 'ASC']]
    });
  }

  async findRoleById(roleId) {
    return await Role.findByPk(roleId, {
      attributes: ['id', 'name', 'slug', 'description', 'priority', ['is_system_role', 'isSystemRole'], ['is_active', 'isActive'], 'updatedBy', ['created_at', 'createdAt'], ['updated_at', 'updatedAt']]
    });
  }

  async createRole(roleData, createdBy) {
    return await Role.create({
      ...roleData,
      createdBy
    });
  }

  async updateRole(roleId, updateData, userId, userName) {
    const role = await Role.findByPk(roleId);
    if (!role) return null;

    return await role.update(updateData, { userId, userName });
  }

  async toggleRoleStatus(roleId, isActive, userId, userName) {
    const role = await Role.findByPk(roleId);
    if (!role) return null;

    return await role.update({ isActive }, { userId, userName });
  }

  async findBySlug(slug) {
    return await Role.findOne({ where: { slug } });
  }

  async findByName(name) {
    return await Role.findOne({ where: { name } });
  }

  async findUsersByRole(roleId, { page = 1, limit = 20, search = '', status = null }) {
    const offset = (page - 1) * limit;
    
    const whereClause = { roleId };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'slug']
        }
      ],
      attributes: ['id', 'fullName', 'mobile', 'email', 'isActive', 'status', ['created_at', 'createdAt']],
      offset,
      limit,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    return { users: rows, total: count };
  }
}

export default new RoleRepository();
