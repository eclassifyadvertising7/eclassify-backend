/**
 * Notification Integration Examples
 * 
 * This file shows how to integrate notifications into existing services.
 * Copy these patterns into your actual service files.
 */

import notificationHelperService from '#services/notificationHelperService.js';

// Example: Integrate into listing service
export const listingServiceIntegration = {
  
  // When listing is approved by admin
  async approveListing(listingId, adminUserId) {
    // ... existing approval logic ...
    
    // Send notification to listing owner
    await notificationHelperService.notifyListingApproved(
      listing.userId,
      {
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        expiresAt: listing.expiresAt
      },
      adminUserId
    );
  },

  // When listing is rejected
  async rejectListing(listingId, adminUserId, reason) {
    // ... existing rejection logic ...
    
    // Send notification to listing owner
    await notificationHelperService.notifyListingRejected(
      listing.userId,
      {
        id: listing.id,
        title: listing.title,
        slug: listing.slug
      },
      adminUserId,
      reason
    );
  },

  // When listing expires (cron job)
  async processExpiredListings() {
    const expiredListings = await this.getExpiredListings();
    
    for (const listing of expiredListings) {
      // Update listing status
      await this.markAsExpired(listing.id);
      
      // Send notification
      await notificationHelperService.notifyListingExpired(
        listing.userId,
        {
          id: listing.id,
          title: listing.title,
          slug: listing.slug
        }
      );
    }
  }
};

// Example: Integrate into chat service
export const chatServiceIntegration = {
  
  // When new message is sent
  async sendMessage(chatRoomId, senderId, messageData) {
    // ... existing message creation logic ...
    
    // Get chat room details
    const chatRoom = await this.getChatRoomWithDetails(chatRoomId);
    const recipient = chatRoom.buyerId === senderId ? chatRoom.seller : chatRoom.buyer;
    
    // Send notification to recipient
    await notificationHelperService.notifyNewMessage(
      recipient.id,
      {
        chatRoomId: chatRoom.id,
        listingId: chatRoom.listingId,
        senderName: sender.fullName,
        listingTitle: chatRoom.listing.title
      },
      messageData.messageText.substring(0, 100) // Preview
    );
  },

  // When offer is made
  async makeOffer(chatRoomId, buyerId, offerAmount) {
    // ... existing offer creation logic ...
    
    const chatRoom = await this.getChatRoomWithDetails(chatRoomId);
    
    // Send notification to seller
    await notificationHelperService.notifyOfferMade(
      chatRoom.sellerId,
      {
        chatRoomId: chatRoom.id,
        listingId: chatRoom.listingId,
        senderName: buyer.fullName,
        listingTitle: chatRoom.listing.title
      },
      offerAmount
    );
  }
};

// Example: Integrate into subscription service
export const subscriptionServiceIntegration = {
  
  // When subscription is activated
  async activateSubscription(subscriptionId) {
    // ... existing activation logic ...
    
    await notificationHelperService.notifySubscriptionActivated(
      subscription.userId,
      {
        id: subscription.id,
        planName: subscription.planName,
        endsAt: subscription.endsAt
      }
    );
  },

  // When payment is successful
  async processSuccessfulPayment(transactionId) {
    // ... existing payment processing logic ...
    
    await notificationHelperService.notifyPaymentSuccessful(
      subscription.userId,
      {
        id: subscription.id,
        planName: subscription.planName
      },
      transaction.amount,
      transaction.id
    );
  },

  // Daily cron job to check expiring subscriptions
  async checkExpiringSubscriptions() {
    const expiringIn7Days = await this.getSubscriptionsExpiringInDays(7);
    const expiringIn3Days = await this.getSubscriptionsExpiringInDays(3);
    const expiringIn1Day = await this.getSubscriptionsExpiringInDays(1);

    // Send 7-day reminders
    for (const subscription of expiringIn7Days) {
      await notificationHelperService.notifySubscriptionExpiring(
        subscription.userId,
        subscription,
        7
      );
    }

    // Send 3-day reminders
    for (const subscription of expiringIn3Days) {
      await notificationHelperService.notifySubscriptionExpiring(
        subscription.userId,
        subscription,
        3
      );
    }

    // Send 1-day reminders
    for (const subscription of expiringIn1Day) {
      await notificationHelperService.notifySubscriptionExpiring(
        subscription.userId,
        subscription,
        1
      );
    }
  }
};

// Example: Integrate into user service for security notifications
export const userServiceIntegration = {
  
  // When user logs in from new device
  async handleLogin(userId, deviceInfo, ipAddress, userAgent) {
    // ... existing login logic ...
    
    // Check if this is a new device
    const isNewDevice = await this.isNewDevice(userId, deviceInfo);
    
    if (isNewDevice) {
      // Get location from IP (optional)
      const location = await this.getLocationFromIP(ipAddress);
      
      await notificationHelperService.notifyLoginNewDevice(
        userId,
        deviceInfo,
        location || 'Unknown location',
        ipAddress
      );
    }
  },

  // When password is changed
  async changePassword(userId, newPassword, ipAddress, userAgent) {
    // ... existing password change logic ...
    
    await notificationHelperService.notifyPasswordChanged(
      userId,
      ipAddress,
      userAgent
    );
  }
};

// Example: Admin broadcast notifications
export const adminNotificationExamples = {
  
  // Send maintenance notification to all users
  async notifyMaintenanceScheduled(startTime, endTime, description) {
    // Get all active user IDs
    const activeUserIds = await this.getAllActiveUserIds();
    
    await notificationHelperService.notifyMaintenanceScheduled(
      activeUserIds,
      startTime,
      endTime,
      description
    );
  },

  // Send feature announcement to premium users
  async announceNewFeature(featureName, description, learnMoreUrl) {
    // Get premium user IDs
    const premiumUserIds = await this.getPremiumUserIds();
    
    await notificationHelperService.notifyFeatureAnnouncement(
      premiumUserIds,
      featureName,
      description,
      learnMoreUrl
    );
  },

  // Send promotional offer to targeted users
  async sendPromotionalOffer(targetUserIds, offerTitle, description, promoCode, expiresAt) {
    await notificationHelperService.notifyPromotionAvailable(
      targetUserIds,
      offerTitle,
      description,
      promoCode,
      expiresAt
    );
  }
};

// Example: Socket.io integration for real-time notifications
export const socketIntegration = {
  
  // Emit notification to user's socket room
  emitNotificationToUser(io, userId, notification) {
    io.to(`user_${userId}`).emit('notification', {
      id: notification.id,
      type: notification.notificationType,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      created_at: notification.createdAt
    });
  },

  // Emit unread count update
  emitUnreadCountUpdate(io, userId, unreadData) {
    io.to(`user_${userId}`).emit('unread_count_update', unreadData);
  },

  // Emit when notification is read
  emitNotificationRead(io, userId, notificationId, readAt) {
    io.to(`user_${userId}`).emit('notification_read', {
      notificationId,
      readAt
    });
  }
};

// Example: Cron job setup in server.js
export const cronJobSetup = `
// In src/server.js or src/app.js

import notificationScheduler from '#jobs/notificationScheduler.js';

// Initialize notification scheduler
notificationScheduler.init();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  notificationScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  notificationScheduler.stop();
  process.exit(0);
});
`;

// Example: Model associations setup
export const modelAssociations = `
// In your model association setup file

import UserNotification from '#models/UserNotification.js';
import UserNotificationPreference from '#models/UserNotificationPreference.js';
import User from '#models/User.js';
import Listing from '#models/Listing.js';
import ChatRoom from '#models/ChatRoom.js';
import UserSubscription from '#models/UserSubscription.js';
import Invoice from '#models/Invoice.js';
import Transaction from '#models/Transaction.js';

// User associations
User.hasMany(UserNotification, { foreignKey: 'userId', as: 'notifications' });
User.hasOne(UserNotificationPreference, { foreignKey: 'userId', as: 'notificationPreferences' });

// Notification associations
UserNotification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserNotification.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });
UserNotification.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });
UserNotification.belongsTo(UserSubscription, { foreignKey: 'subscriptionId', as: 'subscription' });
UserNotification.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
UserNotification.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Preference associations
UserNotificationPreference.belongsTo(User, { foreignKey: 'userId', as: 'user' });
`;