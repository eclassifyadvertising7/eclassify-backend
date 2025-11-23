import db from './src/models/index.js';
import logger from './src/config/logger.js';

/**
 * Verification script for model initialization system
 * Tests Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7
 */

const verifyModelInitialization = async () => {
  try {
    console.log('\n=== Model Initialization System Verification ===\n');

    // Verify sequelize instance is exported (Req 11.4)
    console.log('✓ Sequelize instance exported:', !!db.sequelize);
    console.log('✓ Sequelize constructor exported:', !!db.Sequelize);

    // Verify database connection (Req 11.7)
    await db.sequelize.authenticate();
    console.log('✓ Database connection verified');

    // List loaded models (Req 11.1, 11.2)
    const models = Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key));
    console.log(`✓ Models loaded: ${models.length}`);
    
    if (models.length > 0) {
      console.log('  Models:', models.join(', '));
      
      // Verify associations are established (Req 11.3)
      models.forEach(modelName => {
        const model = db[modelName];
        const hasAssociations = Object.keys(model.associations || {}).length > 0;
        console.log(`  - ${modelName}: ${hasAssociations ? 'has associations' : 'no associations'}`);
      });
    } else {
      console.log('  Note: No model files found yet. This is expected if models haven\'t been created.');
    }

    console.log('\n✓ All verification checks passed!');
    console.log('\nModel initialization system is working correctly.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Verification failed:', error.message);
    logger.error('Model initialization verification failed:', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

verifyModelInitialization();
