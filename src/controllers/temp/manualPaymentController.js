import manualPaymentService from '#services/temp/manualPaymentService.js';
import { uploadPaymentProof, uploadQRCode } from '#config/temp/manualPaymentUploadConfig.js';
import { uploadFile } from '#config/storageConfig.js';
import { getRelativePath } from '#utils/storageHelper.js';
import {
  successResponse,
  createResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse
} from '#utils/responseFormatter.js';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

/**
 * ManualPaymentController - TEMPORARY controller for manual payment verification
 * TODO: Delete this entire file when payment gateway is implemented
 * 
 * This controller handles:
 * 1. End user subscription creation with manual payment
 * 2. Admin listing of subscriptions for verification
 * 3. Admin verification (approve/reject) of manual payments
 */
class ManualPaymentController {
  /**
   * Create subscription with manual payment (End User)
   * POST /api/manual-payments/subscribe
   * Expects multipart/form-data with optional paymentProof file
   */
  static createManualSubscription = [
    // Upload middleware
    uploadPaymentProof,
    
    // Controller logic
    async (req, res) => {
      try {
        const userId = req.user.userId;
        const { planId, upiId, transactionId, customerName, customerMobile } = req.body;

        if (!planId) {
          return errorResponse(res, 'Plan ID is required', 400);
        }

        if (!upiId || !transactionId) {
          return errorResponse(res, 'UPI ID and Transaction ID are required', 400);
        }

        // Process uploaded file if present
        let fileDetails = null;
        if (req.file) {
          try {
            if (STORAGE_TYPE === 'cloudinary') {
              // Upload to Cloudinary
              const folder = 'uploads/manual_payments';
              const uploadResult = await uploadFile(
                req.file,
                folder,
                { resourceType: 'auto' } // auto detects image/pdf
              );

              fileDetails = {
                url: uploadResult.publicId, // Store relative path (without CLOUDINARY_FOLDER prefix)
                storageType: 'cloudinary',
                mimeType: req.file.mimetype,
                size: req.file.size,
                originalName: req.file.originalname
              };
            } else {
              // Local storage - file already saved by multer
              const relativePath = getRelativePath(req.file.path);
              
              fileDetails = {
                url: relativePath, // Store relative path
                storageType: 'local',
                mimeType: req.file.mimetype,
                size: req.file.size,
                originalName: req.file.originalname
              };
            }
          } catch (uploadError) {
            return errorResponse(res, `File upload failed: ${uploadError.message}`, 400);
          }
        }

        const paymentData = {
          upiId,
          transactionId,
          paymentProof: fileDetails,
          customerName: customerName || req.user.fullName || 'Customer',
          customerMobile: customerMobile || req.user.mobile || ''
        };

        const result = await manualPaymentService.createManualSubscription(
          userId,
          parseInt(planId),
          paymentData
        );

        return createResponse(res, result.data, result.message);
      } catch (error) {
        if (error.message.includes('not found')) {
          return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message, 400);
      }
    }
  ];

  /**
   * List subscriptions for manual verification (Admin)
   * GET /api/panel/manual-payments/subscriptions
   */
  static async listSubscriptionsForVerification(req, res) {
    try {
      const filters = {
        status: req.query.status,
        userId: req.query.userId ? parseInt(req.query.userId) : undefined,
        planId: req.query.planId ? parseInt(req.query.planId) : undefined,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        search: req.query.search
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await manualPaymentService.getAllSubscriptionsForVerification(
        filters,
        pagination
      );

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get single subscription for verification (Admin)
   * GET /api/manual-payments/subscriptions/:id
   */
  static async getSubscriptionById(req, res) {
    try {
      const subscriptionId = parseInt(req.params.id);

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      const result = await manualPaymentService.getSubscriptionForVerification(subscriptionId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Verify or cancel manual payment (Admin)
   * POST /api/manual-payments/verify/:id
   */
  static async verifyManualPayment(req, res) {
    try {
      const adminUserId = req.user.userId;
      const adminUserName = req.user.fullName || 'Admin';
      const subscriptionId = parseInt(req.params.id);
      const { approved, notes } = req.body;

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      if (typeof approved !== 'boolean') {
        return errorResponse(res, 'Approved status (true/false) is required', 400);
      }

      const result = await manualPaymentService.verifyManualPayment(
        subscriptionId,
        approved,
        adminUserId,
        adminUserName,
        notes || null
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Store QR code for manual payments (Super Admin)
   * POST /api/panel/manual-payments/qr-code
   */
  static storeQRCode = [
    // Upload middleware
    uploadQRCode,
    
    // Controller logic
    async (req, res) => {
      let uploadedFileDetails = null;

      try {
        const adminUserId = req.user.userId;
        const { caption } = req.body;

        if (!req.file) {
          return errorResponse(res, 'QR code image is required', 400);
        }

        // Process uploaded file
        try {
          if (STORAGE_TYPE === 'cloudinary') {
            // Upload to Cloudinary
            const folder = 'uploads/manual-payment-qr';
            const uploadResult = await uploadFile(
              req.file,
              folder,
              { resourceType: 'image' }
            );

            uploadedFileDetails = {
              url: uploadResult.publicId,
              storageType: 'cloudinary',
              mimeType: req.file.mimetype
            };
          } else {
            // Local storage - file already saved by multer
            const relativePath = getRelativePath(req.file.path);
            
            uploadedFileDetails = {
              url: relativePath,
              storageType: 'local',
              mimeType: req.file.mimetype
            };
          }
        } catch (uploadError) {
          return errorResponse(res, `File upload failed: ${uploadError.message}`, 400);
        }

        const result = await manualPaymentService.storeQRCode(
          uploadedFileDetails,
          adminUserId,
          caption || null
        );

        return createResponse(res, result.data, result.message);
      } catch (error) {
        // Delete uploaded file if something went wrong
        if (uploadedFileDetails) {
          try {
            const { deleteFile } = await import('#config/storageConfig.js');
            await deleteFile(uploadedFileDetails.url, uploadedFileDetails.storageType, { resourceType: 'image' });
          } catch (deleteError) {
            console.error('Failed to delete uploaded file after error:', deleteError);
          }
        }
        return errorResponse(res, error.message, 500);
      }
    }
  ];

  /**
   * Get QR code for manual payments (Public)
   * GET /api/public/manual-payments/qr-code
   */
  static async getQRCode(req, res) {
    try {
      const result = await manualPaymentService.getQRCode();

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default ManualPaymentController;
