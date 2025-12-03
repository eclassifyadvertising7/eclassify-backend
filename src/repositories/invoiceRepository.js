import models from '#models/index.js';
import { Op } from 'sequelize';

const { Invoice, User, UserSubscription, Transaction } = models;

class InvoiceRepository {
  async findById(id) {
    return await Invoice.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'mobile']
        },
        {
          model: UserSubscription,
          as: 'subscription',
          attributes: ['id', 'status', ['start_date', 'startDate'], ['end_date', 'endDate']]
        },
        {
          model: Transaction,
          as: 'transactions',
          attributes: ['id', 'transactionNumber', 'amount', 'status', ['created_at', 'createdAt']]
        }
      ]
    });
  }

  async findAll(filters = {}, pagination = {}) {
    const { userId, status, startDate, endDate } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate[Op.gte] = new Date(startDate);
      if (endDate) where.invoiceDate[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'mobile']
        },
        {
          model: UserSubscription,
          as: 'subscription',
          attributes: ['id', 'status']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      invoices: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async create(invoiceData) {
    return await Invoice.create(invoiceData);
  }

  async update(id, updateData) {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) return null;
    
    return await invoice.update(updateData);
  }

  async findBySubscriptionId(subscriptionId) {
    return await Invoice.findOne({
      where: { subscriptionId }
    });
  }

  async delete(id) {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) return null;
    
    await invoice.destroy();
    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber) {
    return await Invoice.findOne({
      where: { invoiceNumber }
    });
  }

  async updateStatus(id, status) {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) return null;
    
    return await invoice.update({ status });
  }

  async updatePaymentInfo(id, paymentData) {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) return null;
    
    return await invoice.update(paymentData);
  }
}

export default new InvoiceRepository();
