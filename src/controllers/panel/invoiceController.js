import invoiceService from '#services/invoiceService.js';
import { successResponse, errorResponse, paginatedResponse, createResponse } from '#utils/responseFormatter.js';

class InvoiceController {
  static async listInvoices(req, res) {
    try {
      const { userId, status, startDate, endDate, page = 1, limit = 10 } = req.query;

      const filters = {};
      if (userId) filters.userId = userId;
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const pagination = { page: parseInt(page), limit: parseInt(limit) };

      // Super admin can see all invoices (no userId restriction)
      const result = await invoiceService.listInvoices(filters, pagination);

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

      const result = await invoiceService.getInvoiceById(id);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
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

      const result = await invoiceService.downloadInvoice(id);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
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
      const adminId = req.user.userId;
      const invoiceData = req.body;

      const result = await invoiceService.createInvoice(invoiceData, adminId);

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
      const adminId = req.user.userId;
      const updateData = req.body;

      const result = await invoiceService.updateInvoice(id, updateData, adminId);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error updating invoice:', error);
      return errorResponse(res, 'Failed to update invoice', 500);
    }
  }

  static async updateInvoiceStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.user.userId;

      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }

      const result = await invoiceService.updateInvoiceStatus(id, status, adminId);

      if (!result.success) {
        return errorResponse(res, result.message, 404);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return errorResponse(res, 'Failed to update invoice status', 500);
    }
  }
}

export default InvoiceController;
