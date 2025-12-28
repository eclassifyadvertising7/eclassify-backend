import transactionService from '#services/transactionService.js';
import { successResponse, errorResponse, paginatedResponse, createResponse } from '#utils/responseFormatter.js';

class TransactionController {
  static async listTransactions(req, res) {
    try {
      const { status, startDate, endDate, transactionType, page = 1, limit = 10 } = req.query;
      const userId = req.user.userId;

      const filters = {};
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (transactionType) filters.transactionType = transactionType;

      const pagination = { page: parseInt(page), limit: parseInt(limit) };

      const result = await transactionService.listTransactions(filters, pagination, userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve transactions', 500);
    }
  }

  static async getTransaction(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await transactionService.getTransactionById(id);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      if (result.data.userId !== userId) {
        return errorResponse(res, 'You can only view your own transactions', 403);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to retrieve transaction', 500);
    }
  }

  static async createTransaction(req, res) {
    try {
      const userId = req.user.userId;
      const transactionData = {
        ...req.body,
        userId
      };

      const result = await transactionService.createTransaction(transactionData, userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to create transaction', 500);
    }
  }

  static async updateTransaction(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const result = await transactionService.updateTransaction(id, updateData, userId, 'user', userId);

      if (!result.success) {
        return errorResponse(res, result.message, result.message === 'Transaction not found' ? 404 : 403);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to update transaction', 500);
    }
  }
}

export default TransactionController;
