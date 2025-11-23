/**
 * Migration: Add Foreign Key Constraints for Audit Fields
 * 
 * This migration adds back the foreign key constraints for audit fields
 * (created_by, deleted_by) that were initially omitted to avoid circular
 * dependencies during initial table creation.
 * 
 * Tables affected:
 * - roles
 * - permissions
 * - user_subscriptions (invoice_id)
 * 
 * Prerequisites:
 * - users table must exist
 * - invoices table must exist (if adding invoice_id constraint)
 */

export async function up(queryInterface, Sequelize) {
  // Add foreign key constraints to roles table
  await queryInterface.addConstraint('roles', {
    fields: ['created_by'],
    type: 'foreign key',
    name: 'fk_roles_created_by',
    references: {
      table: 'users',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  await queryInterface.addConstraint('roles', {
    fields: ['deleted_by'],
    type: 'foreign key',
    name: 'fk_roles_deleted_by',
    references: {
      table: 'users',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  // Add foreign key constraints to permissions table
  await queryInterface.addConstraint('permissions', {
    fields: ['created_by'],
    type: 'foreign key',
    name: 'fk_permissions_created_by',
    references: {
      table: 'users',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  await queryInterface.addConstraint('permissions', {
    fields: ['deleted_by'],
    type: 'foreign key',
    name: 'fk_permissions_deleted_by',
    references: {
      table: 'users',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  // Note: Uncomment below when invoices table is created
  // Add foreign key constraint to user_subscriptions table for invoice_id
  // await queryInterface.addConstraint('user_subscriptions', {
  //   fields: ['invoice_id'],
  //   type: 'foreign key',
  //   name: 'fk_user_subscriptions_invoice_id',
  //   references: {
  //     table: 'invoices',
  //     field: 'id'
  //   },
  //   onUpdate: 'CASCADE',
  //   onDelete: 'SET NULL'
  // });

  console.log('✅ Foreign key constraints added successfully for audit fields');
}

export async function down(queryInterface, Sequelize) {
  // Remove foreign key constraints from roles table
  await queryInterface.removeConstraint('roles', 'fk_roles_created_by');
  await queryInterface.removeConstraint('roles', 'fk_roles_deleted_by');

  // Remove foreign key constraints from permissions table
  await queryInterface.removeConstraint('permissions', 'fk_permissions_created_by');
  await queryInterface.removeConstraint('permissions', 'fk_permissions_deleted_by');

  // Note: Uncomment below when invoices constraint was added
  // Remove foreign key constraint from user_subscriptions table
  // await queryInterface.removeConstraint('user_subscriptions', 'fk_user_subscriptions_invoice_id');

  console.log('✅ Foreign key constraints removed successfully');
}
