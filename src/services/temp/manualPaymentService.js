import subscriptionRepository from '#repositories/subscriptionRepository.js';
import invoiceRepository from '#repositories/invoiceRepository.js';
import transactionRepository from '#repositories/transactionRepository.js';
import otherMediaRepository from '#repositories/otherMediaRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import { transformPaymentProofMetadata } from '#utils/temp/manualPaymentHelper.js';
import { generateInvoiceNumber, generateTransactionNumber } from '#utils/invoiceNumberGenerator.js';
import { customSlugify } from '#utils/customSlugify.js';
import { deleteFile } from '#config/storageConfig.js';
import { sequelize } from '#models/index.js';

/**
 * ManualPaymentService - TEMPORARY service for manual payment verification
 * TODO: Delete this entire file when payment gateway is implemented
 * 
 * This service handles manual payment verification flow where:
 * 1. User submits payment details (UPI ID, Transaction ID)
 * 2. Subscription/Invoice/Transaction created with PENDING status
 * 3. Admin manually verifies and approves/rejects
 * 4. Upon approval, all records updated to ACTIVE/PAID/COMPLETED
 */
class ManualPaymentService {
  /**
   * Create subscription with manual payment (PENDING status)
   * @param {number} userId - User ID
   * @param {number} planId - Plan ID
   * @param {Object} paymentData - Manual payment data
   * @returns {Promise<Object>} Service response
   */
  async createManualSubscription(userId, planId, paymentData) {
    const transaction = await sequelize.transaction();

    try {
      // Validate manual payment data
      if (!paymentData.upiId || !paymentData.transactionId) {
        throw new Error('UPI ID and Transaction ID are required');
      }

      // Get TARGET plan details
      const targetPlan = await subscriptionRepository.findPlanById(planId);

      if (!targetPlan) {
        throw new Error(ERROR_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND);
      }

      if (!targetPlan.isActive || !targetPlan.isPublic) {
        throw new Error('Plan is not available for subscription');
      }

      // Block free plans from manual payment flow (early check)
      if (targetPlan.isFreePlan) {
        throw new Error('Free plans cannot be purchased through manual payment. Please use the regular subscription flow.');
      }

      // Check if user has pending subscription for this category
      const pendingSubscription = await subscriptionRepository.getUserPendingSubscriptionByCategory(
        userId,
        targetPlan.categoryId
      );

      if (pendingSubscription) {
        throw new Error(
          'You already have a pending subscription for this category. Please wait for admin verification or cancel the pending subscription before creating a new one.'
        );
      }

      // Check eligibility using subscriptionService (reuses existing logic)
      const { default: subscriptionService } = await import('#services/subscriptionService.js');
      const eligibilityCheck = await subscriptionService.checkSubscriptionEligibility(userId, planId);

      if (!eligibilityCheck.data.eligible) {
        throw new Error(eligibilityCheck.data.message);
      }

      // Get CURRENT subscription for expiration (if exists)
      const currentSubscription = await subscriptionRepository.getUserActiveSubscriptionByCategory(
        userId,
        targetPlan.categoryId
      );

      // Calculate temporary dates (will be recalculated on verification)
      const tempActivatedAt = new Date();
      const tempEndsAt = new Date(tempActivatedAt);
      tempEndsAt.setDate(tempEndsAt.getDate() + targetPlan.durationDays);

      // Create subscription with PENDING status
      const subscriptionData = {
        userId,
        planId: targetPlan.id,
        endsAt: tempEndsAt, // Temporary - will be recalculated when admin verifies
        activatedAt: null, // Will be set when admin verifies
        status: 'pending', // PENDING until admin verifies
        isTrial: false,
        trialEndsAt: null,
        autoRenew: false,
        
        // Snapshot plan identification
        planName: targetPlan.name,
        planCode: targetPlan.planCode,
        planVersion: targetPlan.version,
        isFreePlan: targetPlan.isFreePlan,
        
        // Snapshot pricing
        basePrice: targetPlan.basePrice,
        discountAmount: targetPlan.discountAmount,
        finalPrice: targetPlan.finalPrice,
        currency: targetPlan.currency,
        billingCycle: targetPlan.billingCycle,
        durationDays: targetPlan.durationDays,
        
        // Snapshot quotas
        maxTotalListings: targetPlan.maxTotalListings,
        maxActiveListings: targetPlan.maxActiveListings,
        listingQuotaLimit: targetPlan.listingQuotaLimit,
        listingQuotaRollingDays: targetPlan.listingQuotaRollingDays,
        
        // Snapshot featured & promotional
        maxFeaturedListings: targetPlan.maxFeaturedListings,
        maxBoostedListings: targetPlan.maxBoostedListings,
        maxSpotlightListings: targetPlan.maxSpotlightListings,
        maxHomepageListings: targetPlan.maxHomepageListings,
        featuredDays: targetPlan.featuredDays,
        boostedDays: targetPlan.boostedDays,
        spotlightDays: targetPlan.spotlightDays,
        
        // Snapshot visibility & priority
        priorityScore: targetPlan.priorityScore,
        searchBoostMultiplier: targetPlan.searchBoostMultiplier,
        recommendationBoostMultiplier: targetPlan.recommendationBoostMultiplier,
        crossCityVisibility: targetPlan.crossCityVisibility,
        nationalVisibility: targetPlan.nationalVisibility,
        
        // Snapshot listing management
        autoRenewalEnabled: targetPlan.autoRenewal,
        maxRenewals: targetPlan.maxRenewals,
        listingDurationDays: targetPlan.listingDurationDays,
        autoRefreshEnabled: targetPlan.autoRefreshEnabled,
        refreshFrequencyDays: targetPlan.refreshFrequencyDays,
        manualRefreshPerCycle: targetPlan.manualRefreshPerCycle,
        
        // Snapshot support & features
        supportLevel: targetPlan.supportLevel,
        features: targetPlan.features,
        
        // Payment info - Manual
        paymentMethod: 'manual',
        transactionId: paymentData.transactionId,
        amountPaid: 0, // Will be set when admin verifies
        
        // Metadata
        metadata: {
          upiId: paymentData.upiId,
          paymentProof: paymentData.paymentProof || null,
          submittedAt: new Date().toISOString()
        },
        notes: 'Manual payment - Pending admin verification'
      };

      const subscription = await subscriptionRepository.createSubscription(
        subscriptionData,
        userId
      );

      // Expire CURRENT subscription if exists
      if (currentSubscription) {
        await subscriptionRepository.updateSubscription(
          currentSubscription.id,
          {
            status: 'expired',
            endsAt: new Date(),
            notes: `${currentSubscription.notes || ''}\nExpired due to upgrade to new plan on ${new Date().toISOString()}`
          },
          userId
        );
      }

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber(transaction);

      // Create invoice with PENDING status
      const invoice = await invoiceRepository.create({
        invoiceNumber,
        userId,
        subscriptionId: subscription.id,
        invoiceType: 'new_subscription',
        invoiceDate: new Date(),
        customerName: paymentData.customerName || 'Customer',
        customerMobile: paymentData.customerMobile || '',
        planName: targetPlan.name,
        planCode: targetPlan.planCode,
        planVersion: targetPlan.version,
        isFreePlan: targetPlan.isFreePlan,
        planSnapshot: targetPlan.toJSON(),
        subtotal: targetPlan.finalPrice,
        discountAmount: 0,
        adjustedSubtotal: targetPlan.finalPrice,
        taxAmount: 0,
        taxPercentage: 0,
        totalAmount: targetPlan.finalPrice,
        amountPaid: 0,
        amountDue: targetPlan.finalPrice,
        currency: targetPlan.currency,
        status: 'pending',
        paymentMethod: 'manual',
        notes: 'Manual payment - Pending verification',
        metadata: {},
        createdBy: userId
      });

      // Prepare manual payment metadata
      const manualPaymentMetadata = {
        upiId: paymentData.upiId,
        transactionId: paymentData.transactionId,
        submittedAt: new Date().toISOString()
      };

      // Add payment proof details if available
      if (paymentData.paymentProof) {
        manualPaymentMetadata.paymentProof = {
          url: paymentData.paymentProof.url,
          storageType: paymentData.paymentProof.storageType,
          mimeType: paymentData.paymentProof.mimeType,
          size: paymentData.paymentProof.size,
          originalName: paymentData.paymentProof.originalName
        };
      }

      // Generate transaction number
      const transactionNumber = await generateTransactionNumber(transaction);

      // Create transaction with PENDING status
      await transactionRepository.create({
        transactionNumber,
        invoiceId: invoice.id,
        subscriptionId: subscription.id,
        userId,
        subscriptionPlanId: targetPlan.id,
        transactionType: 'payment',
        transactionContext: 'new_subscription',
        transactionMethod: 'manual',
        amount: targetPlan.finalPrice,
        currency: targetPlan.currency,
        paymentGateway: 'manual',
        gatewayPaymentId: paymentData.transactionId,
        manualPaymentMetadata: manualPaymentMetadata,
        status: 'pending',
        initiatedAt: new Date(),
        metadata: {},
        createdBy: userId
      });

      await transaction.commit();

      return {
        success: true,
        message: 'Subscription request submitted successfully. Pending admin verification.',
        data: subscription
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Verify manual payment and activate or cancel subscription (ADMIN ONLY)
   * @param {number} subscriptionId - Subscription ID
   * @param {boolean} approved - Approval status
   * @param {number} adminUserId - Admin user ID
   * @param {string} adminUserName - Admin user name
   * @param {string} notes - Verification notes
   * @returns {Promise<Object>} Service response
   */
  async verifyManualPayment(subscriptionId, approved, adminUserId, adminUserName, notes = null) {
    const transaction = await sequelize.transaction();

    try {
      // Get subscription
      const subscription = await subscriptionRepository.findSubscriptionById(subscriptionId);

      if (!subscription) {
        throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      }

      if (subscription.status !== 'pending') {
        throw new Error('Only pending subscriptions can be verified');
      }

      if (approved) {
        // APPROVE: Activate subscription with verification timestamp
        const verificationTime = new Date();
        const newEndsAt = new Date(verificationTime);
        newEndsAt.setDate(newEndsAt.getDate() + subscription.durationDays);

        await subscriptionRepository.updateSubscription(
          subscriptionId,
          {
            status: 'active',
            endsAt: newEndsAt, // Recalculate from verification time
            activatedAt: verificationTime,
            amountPaid: subscription.finalPrice,
            notes: notes || 'Payment verified and approved by admin'
          },
          adminUserId
        );

        // Update invoice
        const invoice = await invoiceRepository.findBySubscriptionId(subscriptionId);
        if (invoice) {
          const currentUpdates = invoice.updatedBy || [];
          await invoiceRepository.update(invoice.id, {
            status: 'paid',
            amountPaid: subscription.finalPrice,
            amountDue: 0,
            paymentDate: verificationTime,
            notes: notes || 'Payment verified by admin',
            updatedBy: [
              ...currentUpdates,
              {
                userId: adminUserId,
                userName: adminUserName,
                timestamp: new Date().toISOString()
              }
            ]
          });
        }

        // Update transaction
        const txn = await transactionRepository.findBySubscriptionId(subscriptionId);
        if (txn) {
          const currentUpdates = txn.updatedBy || [];
          await transactionRepository.update(txn.id, {
            status: 'completed',
            completedAt: verificationTime,
            verifiedBy: adminUserId,
            verifiedAt: verificationTime,
            verificationNotes: notes || 'Payment verified by admin',
            updatedBy: [
              ...currentUpdates,
              {
                userId: adminUserId,
                userName: adminUserName,
                timestamp: new Date().toISOString()
              }
            ]
          });
        }

        await transaction.commit();

        return {
          success: true,
          message: 'Payment verified and subscription activated successfully',
          data: await subscriptionRepository.findSubscriptionById(subscriptionId)
        };
      } else {
        // REJECT: Cancel subscription
        await subscriptionRepository.updateSubscription(
          subscriptionId,
          {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: notes || 'Payment verification failed',
            notes: notes || 'Payment rejected by admin'
          },
          adminUserId
        );

        // Update invoice
        const invoice = await invoiceRepository.findBySubscriptionId(subscriptionId);
        if (invoice) {
          const currentUpdates = invoice.updatedBy || [];
          await invoiceRepository.update(invoice.id, {
            status: 'cancelled',
            notes: notes || 'Payment rejected by admin',
            updatedBy: [
              ...currentUpdates,
              {
                userId: adminUserId,
                userName: adminUserName,
                timestamp: new Date().toISOString()
              }
            ]
          });
        }

        // Update transaction
        const txn = await transactionRepository.findBySubscriptionId(subscriptionId);
        if (txn) {
          const currentUpdates = txn.updatedBy || [];
          await transactionRepository.update(txn.id, {
            status: 'failed',
            failureReason: notes || 'Payment verification failed',
            verifiedBy: adminUserId,
            verifiedAt: new Date(),
            verificationNotes: notes || 'Payment rejected by admin',
            updatedBy: [
              ...currentUpdates,
              {
                userId: adminUserId,
                userName: adminUserName,
                timestamp: new Date().toISOString()
              }
            ]
          });
        }

        await transaction.commit();

        return {
          success: true,
          message: 'Payment rejected and subscription cancelled',
          data: await subscriptionRepository.findSubscriptionById(subscriptionId)
        };
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get single subscription for verification (Admin)
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Service response
   */
  async getSubscriptionForVerification(subscriptionId) {
    const subscription = await subscriptionRepository.findSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }

    // Get transaction details
    const transaction = await transactionRepository.findBySubscriptionId(subscription.id);
    
    // Get invoice details
    const invoice = await invoiceRepository.findBySubscriptionId(subscription.id);

    // Get full plan details
    const plan = await subscriptionRepository.findPlanById(subscription.planId);

    const enrichedSubscription = {
      ...subscription.toJSON(),
      transaction: transaction ? {
        id: transaction.id,
        transactionNumber: transaction.transactionNumber,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentGateway: transaction.paymentGateway,
        gatewayPaymentId: transaction.gatewayPaymentId,
        manualPaymentMetadata: transformPaymentProofMetadata(transaction.manualPaymentMetadata),
        status: transaction.status,
        initiatedAt: transaction.initiatedAt,
        completedAt: transaction.completedAt,
        verifiedBy: transaction.verifiedBy,
        verifiedAt: transaction.verifiedAt,
        verificationNotes: transaction.verificationNotes
      } : null,
      invoice: invoice ? {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        amountPaid: invoice.amountPaid,
        amountDue: invoice.amountDue,
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        paymentDate: invoice.paymentDate
      } : null,
      planDetails: plan ? {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        planCode: plan.planCode,
        version: plan.version,
        description: plan.description,
        basePrice: plan.basePrice,
        discountAmount: plan.discountAmount,
        finalPrice: plan.finalPrice,
        currency: plan.currency,
        durationDays: plan.durationDays,
        features: plan.features
      } : null
    };

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: enrichedSubscription
    };
  }

  /**
   * Get all subscriptions with filters (for manual verification)
   * Includes subscription plan details and transaction details
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Service response
   */
  async getAllSubscriptionsForVerification(filters = {}, pagination = {}) {
    const result = await subscriptionRepository.getAllSubscriptions(filters, pagination);

    // Enrich subscriptions with transaction details
    const enrichedSubscriptions = await Promise.all(
      result.subscriptions.map(async (subscription) => {
        // Get transaction details
        const transaction = await transactionRepository.findBySubscriptionId(subscription.id);
        
        // Get invoice details
        const invoice = await invoiceRepository.findBySubscriptionId(subscription.id);

        // Get full plan details
        const plan = await subscriptionRepository.findPlanById(subscription.planId);

        return {
          ...subscription.toJSON(),
          transaction: transaction ? {
            id: transaction.id,
            transactionNumber: transaction.transactionNumber,
            amount: transaction.amount,
            currency: transaction.currency,
            paymentGateway: transaction.paymentGateway,
            gatewayPaymentId: transaction.gatewayPaymentId,
            manualPaymentMetadata: transformPaymentProofMetadata(transaction.manualPaymentMetadata),
            status: transaction.status,
            initiatedAt: transaction.initiatedAt,
            completedAt: transaction.completedAt,
            verifiedBy: transaction.verifiedBy,
            verifiedAt: transaction.verifiedAt,
            verificationNotes: transaction.verificationNotes
          } : null,
          invoice: invoice ? {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            totalAmount: invoice.totalAmount,
            amountPaid: invoice.amountPaid,
            amountDue: invoice.amountDue,
            status: invoice.status,
            invoiceDate: invoice.invoiceDate,
            paymentDate: invoice.paymentDate
          } : null,
          planDetails: plan ? {
            id: plan.id,
            name: plan.name,
            slug: plan.slug,
            planCode: plan.planCode,
            version: plan.version,
            description: plan.description,
            basePrice: plan.basePrice,
            discountAmount: plan.discountAmount,
            finalPrice: plan.finalPrice,
            currency: plan.currency,
            durationDays: plan.durationDays,
            features: plan.features
          } : null
        };
      })
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: enrichedSubscriptions,
      pagination: result.pagination
    };
  }

  /**
   * Store QR code for manual payments (Super Admin)
   * @param {Object} fileDetails - File upload details
   * @param {number} adminUserId - Admin user ID
   * @param {string|null} caption - Optional caption from frontend
   * @returns {Promise<Object>} Service response
   */
  async storeQRCode(fileDetails, adminUserId, caption = null) {
    let oldFileDetails = null;

    try {
      const identifierSlug = 'manual-payment-qr';
      
      // Check if QR code already exists
      const existingQR = await otherMediaRepository.getByIdentifierSlug(identifierSlug);
      
      if (existingQR) {
        // Store old file details for deletion after successful update
        oldFileDetails = {
          url: existingQR.mediaUrl,
          storageType: existingQR.storageType
        };
        
        // Update existing record with new file details
        const updatedQR = await otherMediaRepository.update(existingQR.id, {
          caption: caption || existingQR.caption,
          mediaUrl: fileDetails.url,
          thumbnailUrl: fileDetails.url,
          mimeType: fileDetails.mimeType,
          thumbnailMimeType: fileDetails.mimeType,
          storageType: fileDetails.storageType
        });

        // Delete old file from storage after successful update
        if (oldFileDetails) {
          try {
            await deleteFile(oldFileDetails.url, oldFileDetails.storageType, { resourceType: 'image' });
          } catch (deleteError) {
            console.error('Failed to delete old QR code file:', deleteError);
            // Don't throw error - update was successful
          }
        }

        return {
          success: true,
          message: 'QR code updated successfully',
          data: updatedQR
        };
      }

      // Generate unique slug for the media record
      const baseSlug = customSlugify('manual-payment-qr');
      const alphaCode = this._generateAlphaNumericCode(4);
      const slug = `${baseSlug}-${alphaCode}`;

      // Create new QR code record
      const qrCode = await otherMediaRepository.create({
        identifierSlug,
        slug,
        caption: caption || null,
        subCaption: null,
        description: null,
        mediaType: 'image',
        mediaUrl: fileDetails.url,
        thumbnailUrl: fileDetails.url,
        mimeType: fileDetails.mimeType,
        thumbnailMimeType: fileDetails.mimeType,
        displayOrder: 0,
        isPrimary: true,
        storageType: fileDetails.storageType
      });

      return {
        success: true,
        message: 'QR code uploaded successfully',
        data: qrCode
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get QR code for manual payments (Public)
   * @returns {Promise<Object>} Service response
   */
  async getQRCode() {
    try {
      const identifierSlug = 'manual-payment-qr';
      const qrCode = await otherMediaRepository.getByIdentifierSlug(identifierSlug);

      if (!qrCode) {
        return {
          success: true,
          message: 'No QR code available',
          data: null
        };
      }

      return {
        success: true,
        message: 'QR code retrieved successfully',
        data: qrCode
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate alphanumeric code
   * @param {number} limit - Length of code
   * @returns {string}
   * @private
   */
  _generateAlphaNumericCode(limit = 4) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < limit; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  }
}

// Export singleton instance
export default new ManualPaymentService();
