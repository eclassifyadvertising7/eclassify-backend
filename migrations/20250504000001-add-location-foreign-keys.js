/**
 * Migration: Add location_id foreign key constraints
 * This migration adds foreign key constraints to existing location_id columns
 * after the locations table has been created (20250503000001)
 * 
 * Note: The columns already exist in the tables, we're just adding the FK constraints
 */

export async function up(queryInterface, Sequelize) {
  // Add foreign key constraint to user_profiles.preferred_location_id
  await queryInterface.addConstraint('user_profiles', {
    fields: ['preferred_location_id'],
    type: 'foreign key',
    name: 'fk_user_profiles_preferred_location_id',
    references: {
      table: 'locations',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  // Add foreign key constraint to listings.location_id
  await queryInterface.addConstraint('listings', {
    fields: ['location_id'],
    type: 'foreign key',
    name: 'fk_listings_location_id',
    references: {
      table: 'locations',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });
}

export async function down(queryInterface, Sequelize) {
  // Remove foreign key constraints
  await queryInterface.removeConstraint('listings', 'fk_listings_location_id');
  await queryInterface.removeConstraint('user_profiles', 'fk_user_profiles_preferred_location_id');
}
