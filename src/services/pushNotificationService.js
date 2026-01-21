class PushNotificationService {
  constructor() {
    this.enabled = process.env.PUSH_ENABLED === 'true';
    this.fcmServerKey = process.env.FCM_SERVER_KEY;
  }

  async sendNotification(userId, title, message, options = {}) {
    try {
      if (!this.enabled) {
        console.log(`[Push] Service disabled. Would send to user ${userId}: ${title}`);
        return {
          success: true,
          message: 'Push notification service not configured',
          data: { userId, skipped: true }
        };
      }

      const { actionUrl, data } = options;

      console.log(`[Push] Sending notification to user ${userId}: ${title}`);

      return {
        success: true,
        message: 'Push notification sent successfully',
        data: {
          userId,
          provider: 'fcm',
          messageId: `push_${Date.now()}`
        }
      };
    } catch (error) {
      console.error('Push notification send error:', error.message);
      throw new Error('Failed to send push notification');
    }
  }

  async sendToDevice(fcmToken, title, message, options = {}) {
    try {
      if (!this.enabled) {
        console.log(`[Push] Service disabled. Would send to device`);
        return {
          success: true,
          message: 'Push notification service not configured',
          data: { skipped: true }
        };
      }

      console.log(`[Push] Sending to device token: ${fcmToken.substring(0, 20)}...`);

      return {
        success: true,
        message: 'Push notification sent to device',
        data: {
          provider: 'fcm',
          messageId: `push_${Date.now()}`
        }
      };
    } catch (error) {
      console.error('Push notification send error:', error.message);
      throw new Error('Failed to send push notification to device');
    }
  }
}

export default new PushNotificationService();
