import models from '#models/index.js';
import { Op } from 'sequelize';

const { Transaction, Invoice, User, UserSubscription, SubscriptionPlan } = models;

class TransactionRepository {
  async findById(id) {
    return await Transaction.findByPk(id, {
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: ['id', 'invoiceNumber', 'totalAmount', 'status']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'mobile']
        },
        {
          model: UserSubscription,
          as: 'subscription',
          attributes: ['id', 'status']
        },
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'planCode']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'email']
        }
      ]
    });
  }

  async findAll(filters = {}, pagination = {}) {
    const { userId, status, startDate, endDate, transactionType } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (transactionType) where.transactionType = transactionType;
    if (startDate || endDate) {
      where.initiatedAt = {};
      if (startDate) where.initiatedAt[Op.gte] = new Date(startDate);
      if (endDate) where.initiatedAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: ['id', 'invoiceNumber', 'totalAmount']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'mobile']
        },
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'planCode']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      transactions: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async create(transactionData) {
    return await Transaction.create(transactionData);
  }

  async update(id, updateData) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return null;
    
    return await transaction.update(updateData);
  }

  async findBySubscriptionId(subscriptionId) {
    return await Transaction.findOne({
      where: { subscriptionId }
    });
  }

  async delete(id) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return null;
    
    await transaction.destroy();
    return transaction;
  }

  async findByTransactionNumber(transactionNumber) {
    return await Transaction.findOne({
      where: { transactionNumber }
    });
  }

  async updateStatus(id, status, additionalData = {}) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return null;
    
    return await transaction.update({ status, ...additionalData });
  }

  async verifyTransaction(id, verifierId, notes) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return null;
    
    return await transaction.update({
      verifiedBy: verifierId,
      verifiedAt: new Date(),
      verificationNotes: notes,
      status: 'completed'
    });
  }
}

export default new TransactionRepository();
