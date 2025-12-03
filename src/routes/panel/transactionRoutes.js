import express from 'express';
import TransactionController from '#controllers/panel/transactionController.js';
import { authenticate, authorize } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and super_admin role
router.use(authenticate);
router.use(authorize(['super_admin', 'admin', 'accountant']));

// List all transactions with filters
router.get('/', TransactionController.listTransactions);

// Get specific transaction
router.get('/:id', TransactionController.getTransaction);

// Create transaction
router.post('/', TransactionController.createTransaction);

// Update transaction status
router.patch('/status/:id', TransactionController.updateTransactionStatus);

// Verify transaction (manual payment)
router.patch('/verify/:id', TransactionController.verifyTransaction);

// Update transaction
router.put('/:id', TransactionController.updateTransaction);

export default router;
