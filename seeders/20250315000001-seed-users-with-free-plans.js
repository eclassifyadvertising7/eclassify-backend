import bcrypt from "bcrypt";

export async function up(queryInterface, Sequelize) {
  // First, check if free plans exist
  const [freePlans] = await queryInterface.sequelize.query(
    "SELECT id, plan_code, category_id FROM subscription_plans WHERE plan_code IN ('cars-free', 'properties-free') AND is_free_plan = true AND is_active = true"
  );

  if (freePlans.length === 0) {
    console.log('⚠️  No free plans found. Skipping user seeder with free plan assignment.');
    console.log('   Please run subscription plans seeder first: npx sequelize-cli db:seed --seed 20250311000001-seed-subscription-plans.js');
    return;
  }

  const carsFreePlan = freePlans.find(p => p.plan_code === 'cars-free');
  const propertiesFreePlan = freePlans.find(p => p.plan_code === 'properties-free');

  if (!carsFreePlan || !propertiesFreePlan) {
    console.log('⚠️  Missing required free plans (cars-free or properties-free). Skipping user seeder.');
    console.log('   Found plans:', freePlans.map(p => p.plan_code));
    return;
  }

  // Get role IDs dynamically
  const [roles] = await queryInterface.sequelize.query(
    "SELECT id, slug FROM roles WHERE slug IN ('super_admin', 'user', 'employee')"
  );

  const superAdminRole = roles.find((r) => r.slug === "super_admin");
  const userRole = roles.find((r) => r.slug === "user");
  const employeeRole = roles.find((r) => r.slug === "employee");

  if (!superAdminRole || !userRole || !employeeRole) {
    throw new Error(
      "Required roles (super_admin, user, employee) not found. Please run role seeders first."
    );
  }

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("12345678", salt);
  const userHashedPassword = await bcrypt.hash("12345678", salt);

  const now = new Date();
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 25); // 25 years from now for free plans

  // Check if users already exist to avoid duplicates
  const [existingUsers] = await queryInterface.sequelize.query(
    "SELECT mobile FROM users WHERE mobile IN ('9175113022', '9123456789', '8002111222', '8002333444', '8002445566', '8002666777')"
  );

  if (existingUsers.length > 0) {
    console.log('⚠️  Some users already exist. Skipping user creation to avoid duplicates.');
    console.log('   Existing users:', existingUsers.map(u => u.mobile));
    return;
  }

  // Insert users with same mobile numbers as original seeder
  const usersToInsert = [
    {
      country_code: "+91",
      mobile: "9175113022",
      full_name: "Abhijit Abd",
      email: "abhijit.eclassify@yopmail.com",
      password_hash: hashedPassword,
      role_id: superAdminRole.id,
      status: "active",
      is_active: true,
      is_password_reset: false,
      is_phone_verified: true,
      is_email_verified: true,
      phone_verified_at: now,
      email_verified_at: now,
      kyc_status: "approved",
      is_verified: true,
      max_devices: 5,
      is_auto_approve_enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      country_code: "+91",
      mobile: "9123456789",
      full_name: "Super Admin",
      email: "superadmin.eclassify@yopmail.com",
      password_hash: hashedPassword,
      role_id: superAdminRole.id,
      status: "active",
      is_active: true,
      is_password_reset: false,
      is_phone_verified: true,
      is_email_verified: true,
      phone_verified_at: now,
      email_verified_at: now,
      kyc_status: "approved",
      is_verified: true,
      max_devices: 5,
      is_auto_approve_enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      country_code: "+91",
      mobile: "8002111222",
      full_name: "Akshay",
      email: "akshay.eclassify@yopmail.com",
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
      mobile: "8002333444",
      full_name: "Saif",
      email: "saif.eclassify@yopmail.com",
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
      mobile: "8002444555",
      full_name: "Amit",
      email: "amit.eclassify@yopmail.com",
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
      mobile: "8002888999",
      full_name: "Employee",
      email: "employee.eclassify@yopmail.com",
      password_hash: userHashedPassword,
      role_id: employeeRole.id,
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

  // Get the inserted user IDs - ONLY regular users and employee (not super admins)
  const [insertedUsers] = await queryInterface.sequelize.query(
    "SELECT id, mobile, full_name, role_id FROM users WHERE mobile IN ('8002111222', '8002333444', '8002445566', '8002666777')"
  );

  console.log(`✅ Created ${usersToInsert.length} users total`);
  console.log(`✅ Assigning free plans to ${insertedUsers.length} regular users (super admins don't need subscriptions)`);

  // Skip subscription assignment if no regular users
  if (insertedUsers.length === 0) {
    console.log('⚠️  No regular users found to assign free plans to.');
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
      support_level, features, is_free_plan
    FROM subscription_plans 
    WHERE id IN (${carsFreePlan.id}, ${propertiesFreePlan.id})
  `);

  const carsFreePlanDetails = fullPlanDetails.find(p => p.id === carsFreePlan.id);
  const propertiesFreePlanDetails = fullPlanDetails.find(p => p.id === propertiesFreePlan.id);

  // Create subscriptions for each user (both Cars and Properties free plans)
  const subscriptionsToInsert = [];

  insertedUsers.forEach(user => {
    // Cars free plan subscription
    subscriptionsToInsert.push({
      user_id: user.id,
      plan_id: carsFreePlanDetails.id,
      ends_at: futureDate,
      activated_at: now,
      status: 'active',
      is_trial: false,
      auto_renew: false,
      // Plan snapshot
      plan_name: carsFreePlanDetails.name,
      plan_code: carsFreePlanDetails.plan_code,
      plan_version: carsFreePlanDetails.version,
      is_free_plan: carsFreePlanDetails.is_free_plan,
      // Pricing snapshot
      base_price: carsFreePlanDetails.base_price,
      discount_amount: carsFreePlanDetails.discount_amount,
      final_price: carsFreePlanDetails.final_price,
      currency: carsFreePlanDetails.currency,
      billing_cycle: carsFreePlanDetails.billing_cycle,
      duration_days: carsFreePlanDetails.duration_days,
      // Quotas snapshot
      max_total_listings: carsFreePlanDetails.max_total_listings,
      max_active_listings: carsFreePlanDetails.max_active_listings,
      listing_quota_limit: carsFreePlanDetails.listing_quota_limit,
      listing_quota_rolling_days: carsFreePlanDetails.listing_quota_rolling_days,
      // Featured limits snapshot
      max_featured_listings: carsFreePlanDetails.max_featured_listings,
      max_boosted_listings: carsFreePlanDetails.max_boosted_listings,
      max_spotlight_listings: carsFreePlanDetails.max_spotlight_listings,
      max_homepage_listings: carsFreePlanDetails.max_homepage_listings,
      featured_days: carsFreePlanDetails.featured_days,
      boosted_days: carsFreePlanDetails.boosted_days,
      spotlight_days: carsFreePlanDetails.spotlight_days,
      // Visibility snapshot
      priority_score: carsFreePlanDetails.priority_score,
      search_boost_multiplier: carsFreePlanDetails.search_boost_multiplier,
      recommendation_boost_multiplier: carsFreePlanDetails.recommendation_boost_multiplier,
      cross_city_visibility: carsFreePlanDetails.cross_city_visibility,
      national_visibility: carsFreePlanDetails.national_visibility,
      // Management snapshot
      auto_renewal_enabled: carsFreePlanDetails.auto_renewal,
      max_renewals: carsFreePlanDetails.max_renewals,
      listing_duration_days: carsFreePlanDetails.listing_duration_days,
      auto_refresh_enabled: carsFreePlanDetails.auto_refresh_enabled,
      refresh_frequency_days: carsFreePlanDetails.refresh_frequency_days,
      manual_refresh_per_cycle: carsFreePlanDetails.manual_refresh_per_cycle,
      is_auto_approve_enabled: carsFreePlanDetails.is_auto_approve_enabled,
      support_level: carsFreePlanDetails.support_level,
      features: typeof carsFreePlanDetails.features === 'string' 
        ? carsFreePlanDetails.features 
        : JSON.stringify(carsFreePlanDetails.features),
      // Payment info
      payment_method: 'free',
      amount_paid: 0.00,
      // Metadata
      metadata: JSON.stringify({
        assignedBy: 'seeder',
        assignedAt: now.toISOString(),
        categoryType: 'cars',
        planType: 'free'
      }),
      notes: `Auto-assigned Cars free plan during user creation via seeder`,
      created_at: now,
      updated_at: now
    });

    // Properties free plan subscription
    subscriptionsToInsert.push({
      user_id: user.id,
      plan_id: propertiesFreePlanDetails.id,
      ends_at: futureDate,
      activated_at: now,
      status: 'active',
      is_trial: false,
      auto_renew: false,
      // Plan snapshot
      plan_name: propertiesFreePlanDetails.name,
      plan_code: propertiesFreePlanDetails.plan_code,
      plan_version: propertiesFreePlanDetails.version,
      is_free_plan: propertiesFreePlanDetails.is_free_plan,
      // Pricing snapshot
      base_price: propertiesFreePlanDetails.base_price,
      discount_amount: propertiesFreePlanDetails.discount_amount,
      final_price: propertiesFreePlanDetails.final_price,
      currency: propertiesFreePlanDetails.currency,
      billing_cycle: propertiesFreePlanDetails.billing_cycle,
      duration_days: propertiesFreePlanDetails.duration_days,
      // Quotas snapshot
      max_total_listings: propertiesFreePlanDetails.max_total_listings,
      max_active_listings: propertiesFreePlanDetails.max_active_listings,
      listing_quota_limit: propertiesFreePlanDetails.listing_quota_limit,
      listing_quota_rolling_days: propertiesFreePlanDetails.listing_quota_rolling_days,
      // Featured limits snapshot
      max_featured_listings: propertiesFreePlanDetails.max_featured_listings,
      max_boosted_listings: propertiesFreePlanDetails.max_boosted_listings,
      max_spotlight_listings: propertiesFreePlanDetails.max_spotlight_listings,
      max_homepage_listings: propertiesFreePlanDetails.max_homepage_listings,
      featured_days: propertiesFreePlanDetails.featured_days,
      boosted_days: propertiesFreePlanDetails.boosted_days,
      spotlight_days: propertiesFreePlanDetails.spotlight_days,
      // Visibility snapshot
      priority_score: propertiesFreePlanDetails.priority_score,
      search_boost_multiplier: propertiesFreePlanDetails.search_boost_multiplier,
      recommendation_boost_multiplier: propertiesFreePlanDetails.recommendation_boost_multiplier,
      cross_city_visibility: propertiesFreePlanDetails.cross_city_visibility,
      national_visibility: propertiesFreePlanDetails.national_visibility,
      // Management snapshot
      auto_renewal_enabled: propertiesFreePlanDetails.auto_renewal,
      max_renewals: propertiesFreePlanDetails.max_renewals,
      listing_duration_days: propertiesFreePlanDetails.listing_duration_days,
      auto_refresh_enabled: propertiesFreePlanDetails.auto_refresh_enabled,
      refresh_frequency_days: propertiesFreePlanDetails.refresh_frequency_days,
      manual_refresh_per_cycle: propertiesFreePlanDetails.manual_refresh_per_cycle,
      is_auto_approve_enabled: propertiesFreePlanDetails.is_auto_approve_enabled,
      support_level: propertiesFreePlanDetails.support_level,
      features: typeof propertiesFreePlanDetails.features === 'string' 
        ? propertiesFreePlanDetails.features 
        : JSON.stringify(propertiesFreePlanDetails.features),
      // Payment info
      payment_method: 'free',
      amount_paid: 0.00,
      // Metadata
      metadata: JSON.stringify({
        assignedBy: 'seeder',
        assignedAt: now.toISOString(),
        categoryType: 'properties',
        planType: 'free'
      }),
      notes: `Auto-assigned Properties free plan during user creation via seeder`,
      created_at: now,
      updated_at: now
    });
  });

  await queryInterface.bulkInsert('user_subscriptions', subscriptionsToInsert);

  console.log(`✅ Created ${subscriptionsToInsert.length} free plan subscriptions`);
  console.log(`   - ${insertedUsers.length} regular users × 2 categories (Cars + Properties)`);
  console.log('   - Super admins have unlimited access without subscriptions');
  console.log('   - All subscriptions are active and expire in 25 years');
  console.log('   - Users can now create listings in both categories');
}

export async function down(queryInterface, Sequelize) {
  // First delete subscriptions for regular users and employee
  const [users] = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE mobile IN ('8002111222', '8002333444', '8002445566', '8002666777')"
  );

  if (users.length > 0) {
    const userIds = users.map(u => u.id);
    
    await queryInterface.bulkDelete('user_subscriptions', {
      user_id: {
        [Sequelize.Op.in]: userIds
      }
    });

    console.log(`✅ Deleted subscriptions for ${users.length} regular users and employee`);
  }

  // Then delete all users (including super admins and employee)
  await queryInterface.bulkDelete("users", {
    mobile: {
      [Sequelize.Op.in]: ["9175113022", "9123456789", "8002111222", "8002333444", "8002444555", "8002666777"],
    },
  });

  console.log('✅ Deleted all users (super admins + regular users + employee with free plan assignments)');
}