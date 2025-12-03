import transactionRepository from '#repositories/transactionRepository.js';
import { ERROR_MESSAGES } from '#utils/constants/messages.js';

class TransactionService {
  async getTransactionById(id) {
    const transaction = await transactionRepository.findById(id);
    
    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }

    return {
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction
    };
  }

  async listTransactions(filters, pagination, userId = null) {
    // If userId provided (end-user), restrict to their transactions only
    if (userId) {
      filters.userId = userId;
    }

    const result = await transactionRepository.findAll(filters, pagination);

    return {
      success: true,
      message: 'Transactions retrieved successfully',
      data: result.transactions,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    };
  }

  async createTransaction(transactionData, createdBy) {
    // Validate required fields
    if (!transactionData.invoiceId || !transactionData.subscriptionId || !transactionData.userId) {
      return {
        success: false,
        message: 'Invoice ID, Subscription ID, and User ID are required'
      };
    }

    if (!transactionData.transactionNumber) {
      return {
        success: false,
        message: 'Transaction number is required'
      };
    }

    if (!transactionData.amount || transactionData.amount <= 0) {
      return {
        success: false,
        message: 'Valid transaction amount is required'
      };
    }

    // Check if transaction number already exists
    const existingTransaction = await transactionRepository.findByTransactionNumber(transactionData.transactionNumber);
    if (existingTransaction) {
      return {
        success: false,
        message: 'Transaction number already exists'
      };
    }

    // Set defaults
    const transactionPayload = {
      ...transactionData,
      transactionType: transactionData.transactionType || 'payment',
      transactionContext: transactionData.transactionContext || 'new_subscription',
      transactionMethod: transactionData.transactionMethod || 'manual',
      currency: transactionData.currency || 'INR',
      status: transactionData.status || 'initiated',
      hasProration: transactionData.hasProration || false,
      prorationAmount: transactionData.prorationAmount || 0,
      paymentGateway: transactionData.paymentGateway || 'manual',
      initiatedAt: transactionData.initiatedAt || new Date(),
      metadata: transactionData.metadata || {},
      createdBy
    };

    const transaction = await transactionRepository.create(transactionPayload);

    return {
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    };
  }

  async updateTransaction(id, updateData, updatedBy, userRole = null, requestUserId = null) {
    const transaction = await transactionRepository.findById(id);
    
    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }

    // If end-user, verify ownership
    if (userRole === 'user' && transaction.userId !== requestUserId) {
      return {
        success: false,
        message: 'You can only update your own transactions'
      };
    }

    // Prevent updating completed/refunded transactions
    if (['completed', 'refunded'].includes(transaction.status) && updateData.amount) {
      return {
        success: false,
        message: 'Cannot modify amount for completed or refunded transactions'
      };
    }

    // Update updatedBy history
    const currentUpdates = transaction.updatedBy || [];
    updateData.updatedBy = [
      ...currentUpdates,
      {
        userId: updatedBy,
        timestamp: new Date().toISOString()
      }
    ];

    const updatedTransaction = await transactionRepository.update(id, updateData);

    return {
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    };
  }

  async updateTransactionStatus(id, status, updatedBy, additionalData = {}) {
    const transaction = await transactionRepository.findById(id);
    
    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }

    const validStatuses = ['initiated', 'pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled', 'expired'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: 'Invalid transaction status'
      };
    }

    // Set completedAt if status is completed
    if (status === 'completed' && !additionalData.completedAt) {
      additionalData.completedAt = new Date();
    }

    const updatedTransaction = await transactionRepository.updateStatus(id, status, additionalData);

    return {
      success: true,
      message: 'Transaction status updated successfully',
      data: updatedTransaction
    };
  }

  async verifyTransaction(id, verifierId, notes) {
    const transaction = await transactionRepository.findById(id);
    
    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }

    if (transaction.status === 'completed') {
      return {
        success: false,
        message: 'Transaction already verified'
      };
    }

    const verifiedTransaction = await transactionRepository.verifyTransaction(id, verifierId, notes);

    return {
      success: true,
      message: 'Transaction verified successfully',
      data: verifiedTransaction
    };
  }
}

export default new TransactionService();
