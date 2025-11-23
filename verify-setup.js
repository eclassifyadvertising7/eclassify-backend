/**
 * Setup Verification Script
 * Tests core system components without requiring database connection
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Verifying Core System Setup...\n');

let allTestsPassed = true;

// Test 1: Environment Configuration
console.log('✓ Test 1: Environment Configuration');
try {
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  - PORT: ${process.env.PORT || 5000}`);
  console.log(`  - CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log('  ✅ Environment variables loaded successfully\n');
} catch (error) {
  console.log(`  ❌ Failed: ${error.message}\n`);
  allTestsPassed = false;
}

// Test 2: Logger Configuration
console.log('✓ Test 2: Logger Configuration');
try {
  const logger = await import('#config/logger.js');
  logger.default.info('Test log message');
  console.log('  ✅ Logger configured successfully\n');
} catch (error) {
  console.log(`  ❌ Failed: ${error.message}\n`);
  allTestsPassed = false;
}

// Test 3: Response Formatters
console.log('✓ Test 3: Response Formatters');
try {
  const formatters = await import('#utils/responseFormatter.js');
  const mockRes = {
    status: (code) => ({
      json: (data) => ({ statusCode: code, ...data })
    })
  };
  
  const result = formatters.successResponse(mockRes, { test: 'data' }, 'Test message');
  if (result.success && result.message === 'Test message') {
    console.log('  ✅ Response formatters working correctly\n');
  } else {
    throw new Error('Response formatter returned unexpected format');
  }
} catch (error) {
  console.log(`  ❌ Failed: ${error.message}\n`);
  allTestsPassed = false;
}

// Test 4: Constants
console.log('✓ Test 4: Message Constants');
try {
  const messages = await import('#utils/constants/messages.js');
  if (messages.SUCCESS_MESSAGES && messages.ERROR_MESSAGES) {
    console.log(`  - Success messages defined: ${Object.keys(messages.SUCCESS_MESSAGES).length}`);
    console.log(`  - Error messages defined: ${Object.keys(messages.ERROR_MESSAGES).length}`);
    console.log('  ✅ Message constants loaded successfully\n');
  } else {
    throw new Error('Message constants not properly exported');
  }
} catch (error) {
  console.log(`  ❌ Failed: ${error.message}\n`);
  allTestsPassed = false;
}

// Test 5: Express App
console.log('✓ Test 5: Express Application');
try {
  const app = await import('./src/app.js');
  if (app.default && typeof app.default.listen === 'function') {
    console.log('  ✅ Express app configured successfully\n');
  } else {
    throw new Error('Express app not properly exported');
  }
} catch (error) {
  console.log(`  ❌ Failed: ${error.message}\n`);
  allTestsPassed = false;
}

// Test 6: Error Handler
console.log('✓ Test 6: Error Handler Middleware');
try {
  const errorHandler = await import('#middleware/errorHandler.js');
  if (errorHandler.default && typeof errorHandler.default === 'function') {
    console.log('  ✅ Error handler middleware loaded successfully\n');
  } else {
    throw new Error('Error handler not properly exported');
  }
} catch (error) {
  console.log(`  ❌ Failed: ${error.message}\n`);
  allTestsPassed = false;
}

// Test 7: Routes
console.log('✓ Test 7: API Routes');
try {
  const routes = await import('#routes/index.js');
  if (routes.default) {
    console.log('  ✅ API routes configured successfully\n');
  } else {
    throw new Error('Routes not properly exported');
  }
} catch (error) {
  console.log(`  ❌ Failed: ${error.message}\n`);
  allTestsPassed = false;
}

// Summary
console.log('═'.repeat(50));
if (allTestsPassed) {
  console.log('✅ All core system components verified successfully!');
  console.log('\n📝 Note: Database connection test skipped (requires PostgreSQL)');
  console.log('   To test database connection, ensure PostgreSQL is running');
  console.log('   and run: npm run dev');
} else {
  console.log('❌ Some tests failed. Please review the errors above.');
  process.exit(1);
}
console.log('═'.repeat(50));
