import express from 'express';
import InvoiceController from '#controllers/panel/invoiceController.js';
import { authenticate, authorize } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and super_admin role
router.use(authenticate);
router.use(authorize(['super_admin', 'admin', 'accountant']));

// List all invoices with filters
router.get('/', InvoiceController.listInvoices);

// Get specific invoice
router.get('/:id', InvoiceController.getInvoice);

// Download invoice
router.get('/:id/download', InvoiceController.downloadInvoice);

// Create invoice
router.post('/', InvoiceController.createInvoice);

// Update invoice status
router.patch('/status/:id', InvoiceController.updateInvoiceStatus);

// Update invoice
router.put('/:id', InvoiceController.updateInvoice);

export default router;
