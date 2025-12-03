import express from 'express';
import InvoiceController from '#controllers/end-user/invoiceController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List user's invoices with filters
router.get('/', InvoiceController.listInvoices);

// Get specific invoice
router.get('/:id', InvoiceController.getInvoice);

// Download invoice
router.get('/:id/download', InvoiceController.downloadInvoice);

// Create invoice
router.post('/', InvoiceController.createInvoice);

// Update invoice
router.put('/:id', InvoiceController.updateInvoice);

export default router;
