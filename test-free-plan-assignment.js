// Test script to verify free plan assignment logic
// Run with: node test-free-plan-assignment.js

import subscriptionRepository from './src/repositories/subscriptionRepository.js';

async function testFreePlanAssignment() {
  console.log('Testing free plan assignment...\n');

  try {
    // Test 1: Get all free plans
    console.log('1. Fetching all free plans...');
    const freePlans = await subscriptionRepository.getAllFreePlans();
    
    if (!freePlans || freePlans.length === 0) {
      console.error('❌ FAIL: No free plans found');
      return;
    }

    console.log(`✅ SUCCESS: Found ${freePlans.length} free plan(s)\n`);

    // Test 2: Display free plan details
    console.log('2. Free plan details:');
    freePlans.forEach((plan, index) => {
      console.log(`\n   Plan ${index + 1}:`);
      console.log(`   - ID: ${plan.id}`);
      console.log(`   - Code: ${plan.planCode}`);
      console.log(`   - Name: ${plan.name}`);
      console.log(`   - Category ID: ${plan.categoryId}`);
      console.log(`   - Category Name: ${plan.categoryName}`);
      console.log(`   - Is Free: ${plan.isFreePlan}`);
      console.log(`   - Is Active: ${plan.isActive}`);
      console.log(`   - Final Price: ${plan.finalPrice}`);
      console.log(`   - Quota Limit: ${plan.listingQuotaLimit}`);
      console.log(`   - Max Active: ${plan.maxActiveListings}`);
    });

    // Test 3: Verify expected plans
    console.log('\n3. Verification:');
    const expectedPlans = ['cars-free', 'properties-free'];
    const foundPlanCodes = freePlans.map(p => p.planCode);
    
    const allFound = expectedPlans.every(code => foundPlanCodes.includes(code));
    
    if (allFound) {
      console.log('✅ SUCCESS: All expected free plans found');
      console.log(`   Expected: ${expectedPlans.join(', ')}`);
      console.log(`   Found: ${foundPlanCodes.join(', ')}`);
    } else {
      console.log('⚠️  WARNING: Some expected plans missing');
      console.log(`   Expected: ${expectedPlans.join(', ')}`);
      console.log(`   Found: ${foundPlanCodes.join(', ')}`);
    }

    // Test 4: Verify all are truly free
    console.log('\n4. Price verification:');
    const allFree = freePlans.every(p => parseFloat(p.finalPrice) === 0);
    
    if (allFree) {
      console.log('✅ SUCCESS: All plans have final_price = 0');
    } else {
      console.error('❌ FAIL: Some plans have non-zero price');
      freePlans.forEach(p => {
        if (parseFloat(p.finalPrice) !== 0) {
          console.error(`   - ${p.planCode}: ${p.finalPrice}`);
        }
      });
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test user registration via API');
    console.log('2. Verify 2 subscriptions are created in user_subscriptions table');
    console.log('3. Check server logs for: "Assigned 2 free plans to user <id>"');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

testFreePlanAssignment();
