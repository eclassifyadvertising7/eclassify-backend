/**
 * Chat Cron Jobs
 * Automated tasks for chat system maintenance
 */

import cron from 'node-cron';
import listingOfferService from '#services/listingOfferService.js';
import chatRoomRepository from '#repositories/chatRoomRepository.js';
import listingRepository from '#repositories/listingRepository.js';
import logger from '#config/logger.js';

class ChatJobs {
  constructor() {
    this.jobs = [];
  }

  /**
   * Initialize all chat cron jobs
   * @param {Object} app - Express app instance (to access io and chatHandler)
   */
  initialize(app) {
    logger.info('Initializing chat cron jobs...');

    // Expire pending offers - Every 12 hours at 00:00 and 12:00
    const expireOffersJob = cron.schedule('0 0,12 * * *', async () => {
      await this.expirePendingOffers();
    });
    this.jobs.push({ name: 'expirePendingOffers', job: expireOffersJob });
    logger.info('✓ Expire pending offers job scheduled (every 12 hours at 00:00 and 12:00)');

    // Deactivate rooms for expired listings - Daily at 2 AM
    const deactivateRoomsJob = cron.schedule('0 2 * * *', async () => {
      await this.deactivateExpiredListingRooms(app);
    });
    this.jobs.push({ name: 'deactivateExpiredListingRooms', job: deactivateRoomsJob });
    logger.info('✓ Deactivate expired listing rooms job scheduled (daily at 2 AM)');

    logger.info(`Chat cron jobs initialized successfully (${this.jobs.length} jobs)`);
    logger.info('Note: On Render free tier, cron jobs may be unreliable due to server spin-down');
  }

  /**
   * Expire pending offers
   * Runs every 12 hours
   */
  async expirePendingOffers() {
    try {
      logger.info('Running job: Expire pending offers');
      
      const result = await listingOfferService.expirePendingOffers();
      
      logger.info(`Expired ${result.data.expiredCount} pending offers`);
    } catch (error) {
      logger.error('Error in expirePendingOffers job:', error);
    }
  }

  /**
   * Deactivate rooms for expired/deleted listings
   * Runs daily at 2 AM
   */
  async deactivateExpiredListingRooms(app) {
    try {
      logger.info('Running job: Deactivate expired listing rooms');
      
      // Find all expired or deleted listings
      const expiredListings = await listingRepository.getAll(
        { 
          status: 'expired'
        },
        { page: 1, limit: 1000 }
      );

      const deletedListings = await listingRepository.getAll(
        {},
        { page: 1, limit: 1000 }
      );

      // Collect listing IDs
      const listingIds = [
        ...expiredListings.listings.map(l => l.id),
        ...deletedListings.listings.filter(l => l.deletedAt).map(l => l.id)
      ];

      if (listingIds.length === 0) {
        logger.info('No expired or deleted listings found');
        return;
      }

      // Deactivate rooms
      const affectedCount = await chatRoomRepository.deactivateByListingIds(listingIds);
      
      logger.info(`Deactivated ${affectedCount} chat rooms for expired/deleted listings`);

      // Emit socket events to connected users
      const io = app.get('io');
      if (io) {
        listingIds.forEach(listingId => {
          io.to(`listing_${listingId}`).emit('room_inactive', {
            listingId,
            reason: 'Listing expired or deleted'
          });
        });
      }
    } catch (error) {
      logger.error('Error in deactivateExpiredListingRooms job:', error);
    }
  }

  /**
   * Stop all cron jobs
   */
  stopAll() {
    logger.info('Stopping all chat cron jobs...');
    
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      logger.info(`✓ Stopped job: ${name}`);
    });
    
    logger.info('All chat cron jobs stopped');
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    return this.jobs.map(({ name, job }) => ({
      name,
      running: job.running || false
    }));
  }
}

// Export singleton instance
export default new ChatJobs();
