import invoiceRepository from '#repositories/invoiceRepository.js';
import { ERROR_MESSAGES } from '#utils/constants/messages.js';

class InvoiceService {
  async getInvoiceById(id) {
    const invoice = await invoiceRepository.findById(id);
    
    if (!invoice) {
      return {
        success: false,
        message: 'Invoice not found'
      };
    }

    return {
      success: true,
      message: 'Invoice retrieved successfully',
      data: invoice
    };
  }

  async listInvoices(filters, pagination, userId = null) {
    // If userId provided (end-user), restrict to their invoices only
    if (userId) {
      filters.userId = userId;
    }

    const result = await invoiceRepository.findAll(filters, pagination);

    return {
      success: true,
      message: 'Invoices retrieved successfully',
      data: result.invoices,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    };
  }

  async createInvoice(invoiceData, createdBy) {
    // Validate required fields
    if (!invoiceData.userId || !invoiceData.subscriptionId) {
      return {
        success: false,
        message: 'User ID and Subscription ID are required'
      };
    }

    if (!invoiceData.invoiceNumber) {
      return {
        success: false,
        message: 'Invoice number is required'
      };
    }

    // Check if invoice number already exists
    const existingInvoice = await invoiceRepository.findByInvoiceNumber(invoiceData.invoiceNumber);
    if (existingInvoice) {
      return {
        success: false,
        message: 'Invoice number already exists'
      };
    }

    // Set defaults
    const invoicePayload = {
      ...invoiceData,
      invoiceDate: invoiceData.invoiceDate || new Date(),
      status: invoiceData.status || 'issued',
      currency: invoiceData.currency || 'INR',
      subtotal: invoiceData.subtotal || 0,
      discountAmount: invoiceData.discountAmount || 0,
      prorationCredit: invoiceData.prorationCredit || 0,
      adjustedSubtotal: invoiceData.adjustedSubtotal || invoiceData.subtotal || 0,
      taxAmount: invoiceData.taxAmount || 0,
      taxPercentage: invoiceData.taxPercentage || 0,
      totalAmount: invoiceData.totalAmount || 0,
      amountPaid: invoiceData.amountPaid || 0,
      amountDue: invoiceData.amountDue || invoiceData.totalAmount || 0,
      metadata: invoiceData.metadata || {},
      createdBy
    };

    const invoice = await invoiceRepository.create(invoicePayload);

    return {
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    };
  }

  async updateInvoice(id, updateData, updatedBy, userRole = null, requestUserId = null) {
    const invoice = await invoiceRepository.findById(id);
    
    if (!invoice) {
      return {
        success: false,
        message: 'Invoice not found'
      };
    }

    // If end-user, verify ownership
    if (userRole === 'user' && invoice.userId !== requestUserId) {
      return {
        success: false,
        message: 'You can only update your own invoices'
      };
    }

    // Prevent updating certain fields if invoice is paid
    if (invoice.status === 'paid' && (updateData.totalAmount || updateData.subtotal)) {
      return {
        success: false,
        message: 'Cannot modify amounts for paid invoices'
      };
    }

    // Update updatedBy history
    const currentUpdates = invoice.updatedBy || [];
    updateData.updatedBy = [
      ...currentUpdates,
      {
        userId: updatedBy,
        timestamp: new Date().toISOString()
      }
    ];

    const updatedInvoice = await invoiceRepository.update(id, updateData);

    return {
      success: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice
    };
  }

  async downloadInvoice(id, userId = null, userRole = null) {
    const invoice = await invoiceRepository.findById(id);
    
    if (!invoice) {
      return {
        success: false,
        message: 'Invoice not found'
      };
    }

    // If end-user, verify ownership
    if (userRole === 'user' && invoice.userId !== userId) {
      return {
        success: false,
        message: 'You can only download your own invoices'
      };
    }

    // Return invoice data for PDF generation
    return {
      success: true,
      message: 'Invoice data retrieved for download',
      data: invoice
    };
  }

  async updateInvoiceStatus(id, status, updatedBy) {
    const invoice = await invoiceRepository.findById(id);
    
    if (!invoice) {
      return {
        success: false,
        message: 'Invoice not found'
      };
    }

    const validStatuses = ['draft', 'issued', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded', 'void'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: 'Invalid invoice status'
      };
    }

    const updatedInvoice = await invoiceRepository.updateStatus(id, status);

    return {
      success: true,
      message: 'Invoice status updated successfully',
      data: updatedInvoice
    };
  }
}

export default new InvoiceService();
