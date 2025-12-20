import userNotificationService from '#services/userNotificationService.js';

class NotificationHelperService {
  static instance = null;

  static getInstance() {
    if (!NotificationHelperService.instance) {
      NotificationHelperService.instance = new NotificationHelperService();
    }
    return NotificationHelperService.instance;
  }

  // Listing-related notifications
  async notifyListingApproved(userId, listingData, approvedBy) {
    return await userNotificationService.createListingNotification(
      userId,
      'listing_approved',
      listingData,
      {
        approvedBy,
        expiresAt: listingData.expiresAt
      }
    );
  }

  async notifyListingRejected(userId, listingData, rejectedBy, reason) {
    return await userNotificationService.createListingNotification(
      userId,
      'listing_rejected',
      listingData,
      {
        rejectedBy,
        rejectionReason: reason
      }
    );
  }

  async notifyListingExpired(userId, listingData) {
    return await userNotificationService.createListingNotification(
      userId,
      'listing_expired',
      listingData
    );
  }

  async notifyListingExpiringSoon(userId, listingData, daysRemaining) {
    return await userNotificationService.createListingNotification(
      userId,
      'listing_expiring_soon',
      listingData,
      { daysRemaining }
    );
  }

  async notifyListingFeatured(userId, listingData, featuredBy, featuredUntil) {
    return await userNotificationService.createListingNotification(
      userId,
      'listing_featured',
      listingData,
      {
        featuredBy,
        featuredUntil
      }
    );
  }

  async notifyListingViewMilestone(userId, listingData, viewCount) {
    return await userNotificationService.createListingNotification(
      userId,
      'listing_view_milestone',
      listingData,
      { viewCount }
    );
  }

  // Chat-related notifications
  async notifyNewMessage(userId, chatData, messagePreview) {
    return await userNotificationService.createChatNotification(
      userId,
      'new_message',
      chatData,
      { messagePreview }
    );
  }

  async notifyOfferMade(userId, chatData, offerAmount) {
    return await userNotificationService.createChatNotification(
      userId,
      'offer_made',
      chatData,
      { amount: offerAmount }
    );
  }

  async notifyOfferAccepted(userId, chatData, offerAmount) {
    return await userNotificationService.createChatNotification(
      userId,
      'offer_accepted',
      chatData,
      { amount: offerAmount }
    );
  }

  async notifyOfferRejected(userId, chatData, offerAmount, reason) {
    return await userNotificationService.createChatNotification(
      userId,
      'offer_rejected',
      chatData,
      { amount: offerAmount, reason }
    );
  }

  async notifyContactRequested(userId, chatData) {
    return await userNotificationService.createChatNotification(
      userId,
      'contact_requested',
      chatData
    );
  }

  async notifyContactShared(userId, chatData) {
    return await userNotificationService.createChatNotification(
      userId,
      'contact_shared',
      chatData
    );
  }

  // Subscription-related notifications
  async notifySubscriptionActivated(userId, subscriptionData) {
    return await userNotificationService.createSubscriptionNotification(
      userId,
      'subscription_activated',
      subscriptionData
    );
  }

  async notifySubscriptionExpiring(userId, subscriptionData, daysRemaining) {
    return await userNotificationService.createSubscriptionNotification(
      userId,
      'subscription_expiring',
      subscriptionData,
      { 
        daysRemaining,
        expiresAt: subscriptionData.endsAt,
        renewalUrl: '/subscriptions/renew'
      }
    );
  }

  async notifySubscriptionExpired(userId, subscriptionData) {
    return await userNotificationService.createSubscriptionNotification(
      userId,
      'subscription_expired',
      subscriptionData
    );
  }

  async notifySubscriptionRenewed(userId, subscriptionData) {
    return await userNotificationService.createSubscriptionNotification(
      userId,
      'subscription_renewed',
      subscriptionData
    );
  }

  async notifyQuotaWarning(userId, subscriptionData, usedQuota, totalQuota) {
    const percentage = Math.round((usedQuota / totalQuota) * 100);
    return await userNotificationService.createSubscriptionNotification(
      userId,
      'quota_warning',
      subscriptionData,
      { 
        usedQuota, 
        totalQuota, 
        percentage,
        upgradeUrl: '/subscriptions/upgrade'
      }
    );
  }

  async notifyQuotaExceeded(userId, subscriptionData) {
    return await userNotificationService.createSubscriptionNotification(
      userId,
      'quota_exceeded',
      subscriptionData,
      { upgradeUrl: '/subscriptions/upgrade' }
    );
  }

  async notifyPaymentSuccessful(userId, subscriptionData, amount, transactionId) {
    return await userNotificationService.createSubscriptionNotification(
      userId,
      'payment_successful',
      subscriptionData,
      { amount, transactionId }
    );
  }

  async notifyPaymentFailed(userId, subscriptionData, amount, reason) {
    return await userNotificationService.createSubscriptionNotification(
      userId,
      'payment_failed',
      subscriptionData,
      { amount, reason, retryUrl: '/subscriptions/retry-payment' }
    );
  }

  async notifyInvoiceGenerated(userId, invoiceData) {
    return await userNotificationService.createNotification({
      userId,
      notificationType: 'invoice_generated',
      category: 'subscription',
      title: 'New invoice generated',
      message: `Invoice #${invoiceData.invoiceNumber} for ₹${invoiceData.totalAmount} has been generated.`,
      data: {
        invoiceNumber: invoiceData.invoiceNumber,
        amount: invoiceData.totalAmount,
        dueDate: invoiceData.dueDate,
        viewUrl: `/invoices/${invoiceData.id}`
      },
      invoiceId: invoiceData.id,
      priority: 'normal'
    });
  }

  // System notifications
  async notifyMaintenanceScheduled(userIds, startTime, endTime, description) {
    const notifications = userIds.map(userId => ({
      userId,
      notificationType: 'maintenance_scheduled',
      category: 'system',
      title: 'Scheduled maintenance',
      message: `System maintenance is scheduled from ${startTime} to ${endTime}. ${description}`,
      data: { startTime, endTime, description },
      priority: 'high',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours before
    }));

    return await userNotificationService.createBulkNotifications(notifications);
  }

  async notifyFeatureAnnouncement(userIds, featureName, description, learnMoreUrl) {
    const notifications = userIds.map(userId => ({
      userId,
      notificationType: 'feature_announcement',
      category: 'system',
      title: `New feature: ${featureName}`,
      message: `We've added a new feature to improve your experience. ${description}`,
      data: { featureName, description, learnMoreUrl },
      priority: 'normal'
    }));

    return await userNotificationService.createBulkNotifications(notifications);
  }

  async notifyPolicyUpdate(userIds, policyType, effectiveDate, changesUrl) {
    const notifications = userIds.map(userId => ({
      userId,
      notificationType: 'policy_update',
      category: 'system',
      title: `${policyType} updated`,
      message: `Our ${policyType} has been updated. Changes take effect on ${effectiveDate}.`,
      data: { policyType, effectiveDate, changesUrl },
      priority: 'normal'
    }));

    return await userNotificationService.createBulkNotifications(notifications);
  }

  // Security notifications
  async notifyLoginNewDevice(userId, deviceInfo, location, ipAddress) {
    return await userNotificationService.createNotification({
      userId,
      notificationType: 'login_new_device',
      category: 'security',
      title: 'New device login',
      message: `Your account was accessed from a new device: ${deviceInfo.deviceName} in ${location}.`,
      data: { 
        deviceInfo, 
        location, 
        ipAddress, 
        loginTime: new Date(),
        securityUrl: '/security/devices'
      },
      priority: 'high'
    });
  }

  async notifyPasswordChanged(userId, ipAddress, userAgent) {
    return await userNotificationService.createNotification({
      userId,
      notificationType: 'password_changed',
      category: 'security',
      title: 'Password changed',
      message: 'Your account password was successfully changed.',
      data: { 
        changeTime: new Date(), 
        ipAddress, 
        userAgent,
        securityUrl: '/security/password'
      },
      priority: 'high'
    });
  }

  async notifyAccountSuspended(userId, reason, suspendedBy, appealUrl) {
    return await userNotificationService.createNotification({
      userId,
      notificationType: 'account_suspended',
      category: 'security',
      title: 'Account suspended',
      message: `Your account has been suspended. Reason: ${reason}`,
      data: { reason, suspendedBy, suspendedAt: new Date(), appealUrl },
      priority: 'urgent'
    });
  }

  async notifySuspiciousActivity(userId, activityType, details, securityUrl) {
    return await userNotificationService.createNotification({
      userId,
      notificationType: 'suspicious_activity',
      category: 'security',
      title: 'Suspicious activity detected',
      message: `We detected suspicious activity on your account: ${activityType}`,
      data: { activityType, details, detectedAt: new Date(), securityUrl },
      priority: 'urgent'
    });
  }

  // Marketing notifications
  async notifyPromotionAvailable(userIds, promotionTitle, description, promoCode, expiresAt) {
    const notifications = userIds.map(userId => ({
      userId,
      notificationType: 'promotion_available',
      category: 'marketing',
      title: `Special offer: ${promotionTitle}`,
      message: `${description} Use code: ${promoCode}`,
      data: { 
        promotionTitle, 
        description, 
        promoCode, 
        expiresAt,
        redeemUrl: '/promotions/redeem'
      },
      priority: 'normal',
      expiresAt: new Date(expiresAt)
    }));

    return await userNotificationService.createBulkNotifications(notifications);
  }

  async notifyFeatureSuggestion(userId, featureName, benefits, upgradeUrl) {
    return await userNotificationService.createNotification({
      userId,
      notificationType: 'feature_suggestion',
      category: 'marketing',
      title: `Unlock ${featureName}`,
      message: `Upgrade your plan to access ${featureName} and ${benefits}`,
      data: { featureName, benefits, upgradeUrl },
      priority: 'low'
    });
  }

  async notifySeasonalOffer(userIds, offerTitle, discount, validUntil, termsUrl) {
    const notifications = userIds.map(userId => ({
      userId,
      notificationType: 'seasonal_offer',
      category: 'marketing',
      title: offerTitle,
      message: `Limited time offer: ${discount}% off on all plans. Valid until ${validUntil}`,
      data: { offerTitle, discount, validUntil, termsUrl },
      priority: 'normal',
      expiresAt: new Date(validUntil)
    }));

    return await userNotificationService.createBulkNotifications(notifications);
  }

  // Bulk notification helpers
  async notifyMultipleUsers(userIds, notificationType, category, title, message, data = {}, options = {}) {
    const notifications = userIds.map(userId => ({
      userId,
      notificationType,
      category,
      title,
      message,
      data,
      priority: options.priority || 'normal',
      scheduledFor: options.scheduledFor || null,
      expiresAt: options.expiresAt || null,
      createdBy: options.createdBy || null
    }));

    return await userNotificationService.createBulkNotifications(notifications);
  }
}

export default NotificationHelperService.getInstance();