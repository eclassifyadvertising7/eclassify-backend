import bcrypt from "bcrypt";

export async function up(queryInterface, Sequelize) {
  // First, check if premium plans exist
  const [premiumPlans] = await queryInterface.sequelize.query(
    "SELECT id, plan_code, category_id FROM subscription_plans WHERE plan_code IN ('cars-premium', 'properties-premium') AND billing_cycle = 'monthly' AND is_active = true"
  );

  if (premiumPlans.length === 0) {
    console.log('⚠️  No premium plans found. Skipping user seeder with premium plan assignment.');
    console.log('   Please run subscription plans seeder first: npx sequelize-cli db:seed --seed 20250311000001-seed-subscription-plans.js');
    return;
  }

  const carsPremiumPlan = premiumPlans.find(p => p.plan_code === 'cars-premium');
  const propertiesPremiumPlan = premiumPlans.find(p => p.plan_code === 'properties-premium');

  if (!carsPremiumPlan || !propertiesPremiumPlan) {
    console.log('⚠️  Missing required premium plans (cars-premium or properties-premium). Skipping user seeder.');
    console.log('   Found plans:', premiumPlans.map(p => p.plan_code));
    return;
  }

  // Get role IDs dynamically
  const [roles] = await queryInterface.sequelize.query(
    "SELECT id, slug FROM roles WHERE slug = 'user'"
  );

  const userRole = roles.find((r) => r.slug === "user");

  if (!userRole) {
    throw new Error(
      "Required role (user) not found. Please run role seeders first."
    );
  }

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const userHashedPassword = await bcrypt.hash("Password@123", salt);

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // 30 days from now for premium plans

  // Check if users already exist to avoid duplicates
  const [existingUsers] = await queryInterface.sequelize.query(
    "SELECT mobile FROM users WHERE mobile IN ('8002555666', '8002666777', '8002777888')"
  );

  if (existingUsers.length > 0) {
    console.log('⚠️  Some users already exist. Skipping user creation to avoid duplicates.');
    console.log('   Existing users:', existingUsers.map(u => u.mobile));
    return;
  }

  // Insert premium users
  const usersToInsert = [
    {
      country_code: "+91",
      mobile: "8002555666",
      full_name: "Parth",
      email: "parth.eclassify@yopmail.com",
      password_hash: userHashedPassword,
      role_id: userRole.id,
      status: "active",
      is_active: true,
      is_password_reset: false,
      is_phone_verified: true,
      is_email_verified: false,
      phone_verified_at: now,
      email_verified_at: null,
      kyc_status: "pending",
      is_verified: false,
      max_devices: 1,
      is_auto_approve_enabled: false,
      created_at: now,
      updated_at: now,
    },
    {
      country_code: "+91",
      mobile: "8002666777",
      full_name: "Rishi",
      email: "rishi.eclassify@yopmail.com",
      password_hash: userHashedPassword,
      role_id: userRole.id,
      status: "active",
      is_active: true,
      is_password_reset: false,
      is_phone_verified: true,
      is_email_verified: false,
      phone_verified_at: now,
      email_verified_at: null,
      kyc_status: "pending",
      is_verified: false,
      max_devices: 1,
      is_auto_approve_enabled: false,
      created_at: now,
      updated_at: now,
    },
    {
      country_code: "+91",
      mobile: "8002777888",
      full_name: "Ketan",
      email: "ketan.eclassify@yopmail.com",
      password_hash: userHashedPassword,
      role_id: userRole.id,
      status: "active",
      is_active: true,
      is_password_reset: false,
      is_phone_verified: true,
      is_email_verified: false,
      phone_verified_at: now,
      email_verified_at: null,
      kyc_status: "pending",
      is_verified: false,
      max_devices: 1,
      is_auto_approve_enabled: false,
      created_at: now,
      updated_at: now,
    },
  ];

  await queryInterface.bulkInsert("users", usersToInsert);

  // Get the inserted user IDs
  const [insertedUsers] = await queryInterface.sequelize.query(
    "SELECT id, mobile, full_name, role_id FROM users WHERE mobile IN ('8002555666', '8002666777', '8002777888')"
  );

  console.log(`✅ Created ${usersToInsert.length} premium users`);
  console.log(`✅ Assigning premium plans to ${insertedUsers.length} users`);

  // Skip subscription assignment if no users
  if (insertedUsers.length === 0) {
    console.log('⚠️  No users found to assign premium plans to.');
    return;
  }

  // Get full plan details for subscription snapshots
  const [fullPlanDetails] = await queryInterface.sequelize.query(`
    SELECT 
      id, plan_code, name, version, category_id,
      base_price, discount_amount, final_price, currency, billing_cycle, duration_days,
      max_total_listings, max_active_listings, listing_quota_limit, listing_quota_rolling_days,
      max_featured_listings, max_boosted_listings, max_spotlight_listings, max_homepage_listings,
      featured_days, boosted_days, spotlight_days,
      priority_score, search_boost_multiplier, recommendation_boost_multiplier,
      cross_city_visibility, national_visibility,
      auto_renewal, max_renewals, listing_duration_days, auto_refresh_enabled,
      refresh_frequency_days, manual_refresh_per_cycle, is_auto_approve_enabled,
      support_level, features
    FROM subscription_plans 
    WHERE id IN (${carsPremiumPlan.id}, ${propertiesPremiumPlan.id})
  `);

  const carsPremiumPlanDetails = fullPlanDetails.find(p => p.id === carsPremiumPlan.id);
  const propertiesPremiumPlanDetails = fullPlanDetails.find(p => p.id === propertiesPremiumPlan.id);

  // Create subscriptions for each user (both Cars and Properties premium plans)
  const subscriptionsToInsert = [];

  insertedUsers.forEach(user => {
    // Cars premium plan subscription
    subscriptionsToInsert.push({
      user_id: user.id,
      plan_id: carsPremiumPlanDetails.id,
      ends_at: futureDate,
      activated_at: now,
      status: 'active',
      is_trial: false,
      auto_renew: false,
      // Plan snapshot
      plan_name: carsPremiumPlanDetails.name,
      plan_code: carsPremiumPlanDetails.plan_code,
      plan_version: carsPremiumPlanDetails.version,
      // Pricing snapshot
      base_price: carsPremiumPlanDetails.base_price,
      discount_amount: carsPremiumPlanDetails.discount_amount,
      final_price: carsPremiumPlanDetails.final_price,
      currency: carsPremiumPlanDetails.currency,
      billing_cycle: carsPremiumPlanDetails.billing_cycle,
      duration_days: carsPremiumPlanDetails.duration_days,
      // Quotas snapshot
      max_total_listings: carsPremiumPlanDetails.max_total_listings,
      max_active_listings: carsPremiumPlanDetails.max_active_listings,
      listing_quota_limit: carsPremiumPlanDetails.listing_quota_limit,
      listing_quota_rolling_days: carsPremiumPlanDetails.listing_quota_rolling_days,
      // Featured limits snapshot
      max_featured_listings: carsPremiumPlanDetails.max_featured_listings,
      max_boosted_listings: carsPremiumPlanDetails.max_boosted_listings,
      max_spotlight_listings: carsPremiumPlanDetails.max_spotlight_listings,
      max_homepage_listings: carsPremiumPlanDetails.max_homepage_listings,
      featured_days: carsPremiumPlanDetails.featured_days,
      boosted_days: carsPremiumPlanDetails.boosted_days,
      spotlight_days: carsPremiumPlanDetails.spotlight_days,
      // Visibility snapshot
      priority_score: carsPremiumPlanDetails.priority_score,
      search_boost_multiplier: carsPremiumPlanDetails.search_boost_multiplier,
      recommendation_boost_multiplier: carsPremiumPlanDetails.recommendation_boost_multiplier,
      cross_city_visibility: carsPremiumPlanDetails.cross_city_visibility,
      national_visibility: carsPremiumPlanDetails.national_visibility,
      // Management snapshot
      auto_renewal_enabled: carsPremiumPlanDetails.auto_renewal,
      max_renewals: carsPremiumPlanDetails.max_renewals,
      listing_duration_days: carsPremiumPlanDetails.listing_duration_days,
      auto_refresh_enabled: carsPremiumPlanDetails.auto_refresh_enabled,
      refresh_frequency_days: carsPremiumPlanDetails.refresh_frequency_days,
      manual_refresh_per_cycle: carsPremiumPlanDetails.manual_refresh_per_cycle,
      is_auto_approve_enabled: carsPremiumPlanDetails.is_auto_approve_enabled,
      support_level: carsPremiumPlanDetails.support_level,
      features: typeof carsPremiumPlanDetails.features === 'string' 
        ? carsPremiumPlanDetails.features 
        : JSON.stringify(carsPremiumPlanDetails.features),
      // Payment info
      payment_method: 'premium',
      amount_paid: carsPremiumPlanDetails.final_price,
      // Metadata
      metadata: JSON.stringify({
        assignedBy: 'seeder',
        assignedAt: now.toISOString(),
        categoryType: 'cars',
        planType: 'premium'
      }),
      notes: `Auto-assigned Cars premium plan during user creation via seeder`,
      created_at: now,
      updated_at: now
    });

    // Properties premium plan subscription
    subscriptionsToInsert.push({
      user_id: user.id,
      plan_id: propertiesPremiumPlanDetails.id,
      ends_at: futureDate,
      activated_at: now,
      status: 'active',
      is_trial: false,
      auto_renew: false,
      // Plan snapshot
      plan_name: propertiesPremiumPlanDetails.name,
      plan_code: propertiesPremiumPlanDetails.plan_code,
      plan_version: propertiesPremiumPlanDetails.version,
      // Pricing snapshot
      base_price: propertiesPremiumPlanDetails.base_price,
      discount_amount: propertiesPremiumPlanDetails.discount_amount,
      final_price: propertiesPremiumPlanDetails.final_price,
      currency: propertiesPremiumPlanDetails.currency,
      billing_cycle: propertiesPremiumPlanDetails.billing_cycle,
      duration_days: propertiesPremiumPlanDetails.duration_days,
      // Quotas snapshot
      max_total_listings: propertiesPremiumPlanDetails.max_total_listings,
      max_active_listings: propertiesPremiumPlanDetails.max_active_listings,
      listing_quota_limit: propertiesPremiumPlanDetails.listing_quota_limit,
      listing_quota_rolling_days: propertiesPremiumPlanDetails.listing_quota_rolling_days,
      // Featured limits snapshot
      max_featured_listings: propertiesPremiumPlanDetails.max_featured_listings,
      max_boosted_listings: propertiesPremiumPlanDetails.max_boosted_listings,
      max_spotlight_listings: propertiesPremiumPlanDetails.max_spotlight_listings,
      max_homepage_listings: propertiesPremiumPlanDetails.max_homepage_listings,
      featured_days: propertiesPremiumPlanDetails.featured_days,
      boosted_days: propertiesPremiumPlanDetails.boosted_days,
      spotlight_days: propertiesPremiumPlanDetails.spotlight_days,
      // Visibility snapshot
      priority_score: propertiesPremiumPlanDetails.priority_score,
      search_boost_multiplier: propertiesPremiumPlanDetails.search_boost_multiplier,
      recommendation_boost_multiplier: propertiesPremiumPlanDetails.recommendation_boost_multiplier,
      cross_city_visibility: propertiesPremiumPlanDetails.cross_city_visibility,
      national_visibility: propertiesPremiumPlanDetails.national_visibility,
      // Management snapshot
      auto_renewal_enabled: propertiesPremiumPlanDetails.auto_renewal,
      max_renewals: propertiesPremiumPlanDetails.max_renewals,
      listing_duration_days: propertiesPremiumPlanDetails.listing_duration_days,
      auto_refresh_enabled: propertiesPremiumPlanDetails.auto_refresh_enabled,
      refresh_frequency_days: propertiesPremiumPlanDetails.refresh_frequency_days,
      manual_refresh_per_cycle: propertiesPremiumPlanDetails.manual_refresh_per_cycle,
      is_auto_approve_enabled: propertiesPremiumPlanDetails.is_auto_approve_enabled,
      support_level: propertiesPremiumPlanDetails.support_level,
      features: typeof propertiesPremiumPlanDetails.features === 'string' 
        ? propertiesPremiumPlanDetails.features 
        : JSON.stringify(propertiesPremiumPlanDetails.features),
      // Payment info
      payment_method: 'premium',
      amount_paid: propertiesPremiumPlanDetails.final_price,
      // Metadata
      metadata: JSON.stringify({
        assignedBy: 'seeder',
        assignedAt: now.toISOString(),
        categoryType: 'properties',
        planType: 'premium'
      }),
      notes: `Auto-assigned Properties premium plan during user creation via seeder`,
      created_at: now,
      updated_at: now
    });
  });

  await queryInterface.bulkInsert('user_subscriptions', subscriptionsToInsert);

  console.log(`✅ Created ${subscriptionsToInsert.length} premium plan subscriptions`);
  console.log(`   - ${insertedUsers.length} users × 2 categories (Cars + Properties)`);
  console.log('   - All subscriptions are active and expire in 30 days');
  console.log('   - Users can now create listings in both categories');
}

export async function down(queryInterface, Sequelize) {
  // First delete subscriptions for premium users
  const [users] = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE mobile IN ('8002555666', '8002666777', '8002777888')"
  );

  if (users.length > 0) {
    const userIds = users.map(u => u.id);
    
    await queryInterface.bulkDelete('user_subscriptions', {
      user_id: {
        [Sequelize.Op.in]: userIds
      }
    });

    console.log(`✅ Deleted subscriptions for ${users.length} premium users`);
  }

  // Then delete all premium users
  await queryInterface.bulkDelete("users", {
    mobile: {
      [Sequelize.Op.in]: ["8002555666", "8002666777", "8002777888"],
    },
  });

  console.log('✅ Deleted all premium users with premium plan assignments');
}