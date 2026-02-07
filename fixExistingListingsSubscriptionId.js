import models from './src/models/index.js';
import sequelize from './src/config/database.js';

const { Listing, UserSubscription, SubscriptionPlan } = models;

async function fixExistingListings() {
  console.log('Starting to fix existing listings without userSubscriptionId...');

  try {
    // Find all listings without userSubscriptionId
    const listingsToFix = await Listing.findAll({
      where: {
        userSubscriptionId: null,
        status: ['pending', 'active', 'sold', 'expired']
      },
      attributes: ['id', 'userId', 'categoryId', 'status', 'title']
    });

    console.log(`Found ${listingsToFix.length} listings to fix`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const listing of listingsToFix) {
      console.log(`\nProcessing listing ID=${listing.id}, userId=${listing.userId}, categoryId=${listing.categoryId}`);

      // Find active subscription for this user and category
      const subscription = await UserSubscription.findOne({
        where: {
          userId: listing.userId,
          status: 'active'
        },
        include: [{
          model: SubscriptionPlan,
          as: 'plan',
          where: {
            categoryId: listing.categoryId
          },
          attributes: ['id', 'name', 'isFreePlan']
        }]
      });

      if (subscription) {
        const isPaidListing = !subscription.plan.isFreePlan;
        
        await listing.update({
          userSubscriptionId: subscription.id,
          isPaidListing
        });

        console.log(`✓ Fixed listing ID=${listing.id}: subscriptionId=${subscription.id}, isPaid=${isPaidListing}`);
        fixedCount++;
      } else {
        console.log(`✗ Skipped listing ID=${listing.id}: No active subscription found for category ${listing.categoryId}`);
        skippedCount++;
      }
    }

    console.log('\n========== SUMMARY ==========');
    console.log(`Total listings processed: ${listingsToFix.length}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Skipped (no subscription): ${skippedCount}`);
    console.log('=============================');

  } catch (error) {
    console.error('Error fixing listings:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

fixExistingListings()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });
