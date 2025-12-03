import express from 'express';
import TransactionController from '#controllers/end-user/transactionController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List user's transactions with filters
router.get('/', TransactionController.listTransactions);

// Get specific transaction
router.get('/:id', TransactionController.getTransaction);

// Create transaction
router.post('/', TransactionController.createTransaction);

// Update transaction
router.put('/:id', TransactionController.updateTransaction);

export default router;
