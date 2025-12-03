import invoiceService from '#services/invoiceService.js';
import { successResponse, errorResponse, paginatedResponse, createResponse } from '#utils/responseFormatter.js';

class InvoiceController {
  static async listInvoices(req, res) {
    try {
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
      const userId = req.user.userId;

      const filters = {};
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const pagination = { page: parseInt(page), limit: parseInt(limit) };

      const result = await invoiceService.listInvoices(filters, pagination, userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      console.error('Error listing invoices:', error);
      return errorResponse(res, 'Failed to retrieve invoices', 500);
    }
  }

  static async getInvoice(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await invoiceService.getInvoiceById(id);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      // Verify ownership
      if (result.data.userId !== userId) {
        return errorResponse(res, 'You can only view your own invoices', 403);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error getting invoice:', error);
      return errorResponse(res, 'Failed to retrieve invoice', 500);
    }
  }

  static async downloadInvoice(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await invoiceService.downloadInvoice(id, userId, 'user');

      if (!result.success) {
        return errorResponse(res, result.message, result.message === 'Invoice not found' ? 404 : 403);
      }

      // TODO: Generate PDF and send as download
      // For now, return invoice data
      return successResponse(res, result.data, 'Invoice ready for download');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      return errorResponse(res, 'Failed to download invoice', 500);
    }
  }

  static async createInvoice(req, res) {
    try {
      const userId = req.user.userId;
      const invoiceData = {
        ...req.body,
        userId // Ensure invoice is created for the authenticated user
      };

      const result = await invoiceService.createInvoice(invoiceData, userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return createResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error creating invoice:', error);
      return errorResponse(res, 'Failed to create invoice', 500);
    }
  }

  static async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const result = await invoiceService.updateInvoice(id, updateData, userId, 'user', userId);

      if (!result.success) {
        return errorResponse(res, result.message, result.message === 'Invoice not found' ? 404 : 403);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error updating invoice:', error);
      return errorResponse(res, 'Failed to update invoice', 500);
    }
  }
}

export default InvoiceController;
