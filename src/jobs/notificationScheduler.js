import cron from 'node-cron';
import userNotificationService from '#services/userNotificationService.js';

class NotificationScheduler {
  static instance = null;

  static getInstance() {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  // Initialize all notification cron jobs
  init() {
    console.log('Initializing notification scheduler...');

    // Process scheduled notifications every 5 minutes
    this.scheduleNotificationProcessor();

    // Daily cleanup of expired notifications at 2 AM
    this.scheduleNotificationCleanup();

    // Daily reminder notifications at 10 AM
    this.scheduleReminderNotifications();

    console.log('Notification scheduler initialized successfully');
  }

  // Process scheduled notifications every 5 minutes
  scheduleNotificationProcessor() {
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('Processing scheduled notifications...');
        const result = await userNotificationService.processScheduledNotifications();
        
        if (result.success && result.data.processedCount > 0) {
          console.log(`Processed ${result.data.processedCount} scheduled notifications`);
        }
      } catch (error) {
        console.error('Error processing scheduled notifications:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    console.log('Scheduled notification processor: Every 5 minutes');
  }

  // Daily cleanup of expired notifications at 2 AM
  scheduleNotificationCleanup() {
    cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Starting notification cleanup...');
        const result = await userNotificationService.cleanupExpiredNotifications(180); // 6 months
        
        if (result.success) {
          console.log(`Notification cleanup completed: ${result.data.deletedCount} notifications deleted`);
        } else {
          console.error('Notification cleanup failed:', result.message);
        }
      } catch (error) {
        console.error('Error during notification cleanup:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    console.log('Scheduled notification cleanup: Daily at 2:00 AM');
  }

  // Daily reminder notifications at 10 AM
  scheduleReminderNotifications() {
    cron.schedule('0 10 * * *', async () => {
      try {
        console.log('Processing daily reminder notifications...');
        
        // Process subscription expiry reminders
        await this.processSubscriptionReminders();
        
        // Process listing expiry reminders
        await this.processListingReminders();
        
        // Process quota warnings
        await this.processQuotaWarnings();
        
        console.log('Daily reminder notifications processed');
      } catch (error) {
        console.error('Error processing daily reminders:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    console.log('Scheduled reminder notifications: Daily at 10:00 AM');
  }

  // Process subscription expiry reminders
  async processSubscriptionReminders() {
    try {
      // TODO: Implement subscription expiry reminder logic
      // This would query user_subscriptions table for subscriptions expiring in 7, 3, 1 days
      // and create appropriate notifications
      
      console.log('Subscription reminders processed (placeholder)');
    } catch (error) {
      console.error('Error processing subscription reminders:', error);
    }
  }

  // Process listing expiry reminders
  async processListingReminders() {
    try {
      // TODO: Implement listing expiry reminder logic
      // This would query listings table for listings expiring in 3 days
      // and create appropriate notifications
      
      console.log('Listing reminders processed (placeholder)');
    } catch (error) {
      console.error('Error processing listing reminders:', error);
    }
  }

  // Process quota warnings
  async processQuotaWarnings() {
    try {
      // TODO: Implement quota warning logic
      // This would check users' listing quotas and send warnings when 80% used
      
      console.log('Quota warnings processed (placeholder)');
    } catch (error) {
      console.error('Error processing quota warnings:', error);
    }
  }

  // Stop all scheduled jobs (for graceful shutdown)
  stop() {
    cron.getTasks().forEach((task, name) => {
      task.stop();
      console.log(`Stopped cron job: ${name}`);
    });
    console.log('Notification scheduler stopped');
  }
}

export default NotificationScheduler.getInstance();