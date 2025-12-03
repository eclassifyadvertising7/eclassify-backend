import transactionService from '#services/transactionService.js';
import { successResponse, errorResponse, paginatedResponse, createResponse } from '#utils/responseFormatter.js';

class TransactionController {
  static async listTransactions(req, res) {
    try {
      const { userId, status, startDate, endDate, transactionType, page = 1, limit = 10 } = req.query;

      const filters = {};
      if (userId) filters.userId = userId;
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (transactionType) filters.transactionType = transactionType;

      const pagination = { page: parseInt(page), limit: parseInt(limit) };

      // Super admin can see all transactions (no userId restriction)
      const result = await transactionService.listTransactions(filters, pagination);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      console.error('Error listing transactions:', error);
      return errorResponse(res, 'Failed to retrieve transactions', 500);
    }
  }

  static async getTransaction(req, res) {
    try {
      const { id } = req.params;

      const result = await transactionService.getTransactionById(id);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error getting transaction:', error);
      return errorResponse(res, 'Failed to retrieve transaction', 500);
    }
  }

  static async createTransaction(req, res) {
    try {
      const adminId = req.user.userId;
      const transactionData = req.body;

      const result = await transactionService.createTransaction(transactionData, adminId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return createResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error creating transaction:', error);
      return errorResponse(res, 'Failed to create transaction', 500);
    }
  }

  static async updateTransaction(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.userId;
      const updateData = req.body;

      const result = await transactionService.updateTransaction(id, updateData, adminId);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error updating transaction:', error);
      return errorResponse(res, 'Failed to update transaction', 500);
    }
  }

  static async updateTransactionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, ...additionalData } = req.body;
      const adminId = req.user.userId;

      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }

      const result = await transactionService.updateTransactionStatus(id, status, adminId, additionalData);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return errorResponse(res, 'Failed to update transaction status', 500);
    }
  }

  static async verifyTransaction(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.user.userId;

      const result = await transactionService.verifyTransaction(id, adminId, notes);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return errorResponse(res, 'Failed to verify transaction', 500);
    }
  }
}

export default TransactionController;
