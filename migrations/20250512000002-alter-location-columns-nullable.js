/**
 * Migration: Make location columns nullable
 * 
 * PostgreSQL triggers run AFTER Sequelize validation.
 * Sequelize checks NOT NULL constraints before the trigger can populate the column.
 * 
 * Solution: Make columns nullable, rely on triggers to always populate them.
 * The trigger guarantees the column will never actually be NULL in practice.
 */

export async function up(queryInterface, Sequelize) {
  console.log('Making location columns nullable for trigger compatibility...');

  // 1. Alter locations.location to nullable
  await queryInterface.changeColumn('locations', 'location', {
    type: 'geography(POINT, 4326)',
    allowNull: true
  });
  console.log('✓ locations.location is now nullable');

  // 2. listings.location is already nullable (no change needed)
  console.log('✓ listings.location is already nullable');

  // 3. user_profiles.preferred_location is already nullable (no change needed)
  console.log('✓ user_profiles.preferred_location is already nullable');

  console.log('\n✓ Migration completed successfully!');
  console.log('Note: Triggers will still populate these columns automatically.');
}

export async function down(queryInterface, Sequelize) {
  console.log('Reverting location columns to NOT NULL...');

  // Revert locations.location to NOT NULL
  await queryInterface.changeColumn('locations', 'location', {
    type: 'geography(POINT, 4326)',
    allowNull: false
  });

  console.log('✓ Reverted locations.location to NOT NULL');
}
