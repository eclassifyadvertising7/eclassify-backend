import listingOfferRepository from '#repositories/listingOfferRepository.js';
import chatRoomRepository from '#repositories/chatRoomRepository.js';
import listingRepository from '#repositories/listingRepository.js';
import chatMessageService from '#services/chatMessageService.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class ListingOfferService {
  async createOffer(roomId, userId, offerData) {
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (participation.userType !== 'buyer') {
      throw new Error('Only buyers can make offers');
    }

    if (!participation.room.isActive) {
      throw new Error('Cannot make offers on inactive listings');
    }

    if (!offerData.amount || offerData.amount <= 0) {
      throw new Error('Offer amount must be greater than 0');
    }

    const listing = await listingRepository.getById(participation.room.listingId);
    
    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (offerData.amount >= listing.price) {
      throw new Error('Offer amount must be less than listing price');
    }

    const pendingCount = await listingOfferRepository.getPendingCountByBuyerAndListing(
      userId,
      participation.room.listingId
    );

    if (pendingCount >= 5) {
      throw new Error('Maximum 5 pending offers allowed per listing');
    }

    const expiresAt = offerData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const offer = await listingOfferRepository.create({
      listingId: participation.room.listingId,
      chatRoomId: roomId,
      buyerId: userId,
      sellerId: participation.room.sellerId,
      offeredAmount: offerData.amount,
      listingPriceAtTime: listing.price,
      notes: offerData.notes || null,
      status: 'pending',
      expiresAt
    });

    await chatMessageService.sendSystemMessage(
      roomId,
      'offer_made',
      `Buyer made an offer of ₹${offerData.amount.toLocaleString()}`,
      {
        offerId: offer.id,
        amount: offerData.amount
      }
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.OFFER_CREATED,
      data: {
        offerId: offer.id,
        amount: offer.offeredAmount,
        status: offer.status
      }
    };
  }

  async getOffers(roomId, userId) {
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    const offers = await listingOfferRepository.getByRoomId(roomId);

    return {
      success: true,
      message: 'Offers retrieved successfully',
      data: offers
    };
  }

  async acceptOffer(offerId, userId) {
    const offer = await listingOfferRepository.getById(offerId, { includeAll: true });
    
    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.sellerId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (offer.status !== 'pending') {
      throw new Error('Only pending offers can be accepted');
    }

    await listingOfferRepository.updateStatus(offerId, 'accepted');

    await chatMessageService.sendSystemMessage(
      offer.chatRoomId,
      'offer_accepted',
      `Seller accepted your offer of ₹${offer.offeredAmount.toLocaleString()}`,
      {
        offerId: offer.id,
        amount: offer.offeredAmount
      }
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.OFFER_ACCEPTED,
      data: null
    };
  }

  async rejectOffer(offerId, userId, reason = null) {
    const offer = await listingOfferRepository.getById(offerId, { includeAll: true });
    
    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.sellerId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (offer.status !== 'pending') {
      throw new Error('Only pending offers can be rejected');
    }

    await listingOfferRepository.updateStatus(offerId, 'rejected', {
      rejectionReason: reason
    });

    await chatMessageService.sendSystemMessage(
      offer.chatRoomId,
      'offer_rejected',
      `Seller rejected your offer of ₹${offer.offeredAmount.toLocaleString()}`,
      {
        offerId: offer.id,
        amount: offer.offeredAmount,
        reason
      }
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.OFFER_REJECTED,
      data: null
    };
  }

  async withdrawOffer(offerId, userId) {
    const offer = await listingOfferRepository.getById(offerId);
    
    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.buyerId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (offer.status !== 'pending') {
      throw new Error('Only pending offers can be withdrawn');
    }

    await listingOfferRepository.updateStatus(offerId, 'withdrawn');

    return {
      success: true,
      message: SUCCESS_MESSAGES.OFFER_WITHDRAWN,
      data: null
    };
  }

  async counterOffer(offerId, userId, counterData) {
    const originalOffer = await listingOfferRepository.getById(offerId, { includeAll: true });
    
    if (!originalOffer) {
      throw new Error('Offer not found');
    }

    if (originalOffer.sellerId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (originalOffer.status !== 'pending') {
      throw new Error('Only pending offers can be countered');
    }

    if (!counterData.amount || counterData.amount <= 0) {
      throw new Error('Counter offer amount must be greater than 0');
    }

    if (counterData.amount <= originalOffer.offeredAmount) {
      throw new Error('Counter offer must be higher than original offer');
    }

    const listing = await listingRepository.getById(originalOffer.listingId);
    
    if (counterData.amount >= listing.price) {
      throw new Error('Counter offer amount must be less than listing price');
    }

    await listingOfferRepository.updateStatus(offerId, 'countered');

    const counterOffer = await listingOfferRepository.create({
      listingId: originalOffer.listingId,
      chatRoomId: originalOffer.chatRoomId,
      buyerId: originalOffer.buyerId,
      sellerId: originalOffer.sellerId,
      offeredAmount: counterData.amount,
      listingPriceAtTime: listing.price,
      notes: counterData.notes || null,
      parentOfferId: offerId,
      status: 'pending',
      expiresAt: counterData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await chatMessageService.sendSystemMessage(
      originalOffer.chatRoomId,
      'offer_made',
      `Seller made a counter offer of ₹${counterData.amount.toLocaleString()}`,
      {
        offerId: counterOffer.id,
        amount: counterData.amount,
        parentOfferId: offerId
      }
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.COUNTER_OFFER_CREATED,
      data: {
        offerId: counterOffer.id,
        amount: counterOffer.offeredAmount,
        status: counterOffer.status
      }
    };
  }

  async expirePendingOffers() {
    const expiredOffers = await listingOfferRepository.expirePendingOffers();

    for (const offer of expiredOffers) {
      await chatMessageService.sendSystemMessage(
        offer.chatRoomId,
        'offer_rejected',
        `Offer of ₹${offer.offeredAmount.toLocaleString()} has expired`,
        {
          offerId: offer.id,
          amount: offer.offeredAmount,
          autoExpired: true
        }
      );
    }

    return {
      success: true,
      message: `${expiredOffers.length} offers expired`,
      data: {
        expiredCount: expiredOffers.length
      }
    };
  }

  async getStats(filters = {}) {
    const stats = await listingOfferRepository.getStats(filters);

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    };
  }

  async getTopListings(limit = 10) {
    const listings = await listingOfferRepository.getTopListingsByOfferCount(limit);

    return {
      success: true,
      message: 'Top listings retrieved successfully',
      data: listings
    };
  }

  async getOfferTrends(days = 30) {
    const trends = await listingOfferRepository.getOfferTrends(days);

    return {
      success: true,
      message: 'Offer trends retrieved successfully',
      data: trends
    };
  }
}

export default new ListingOfferService();
