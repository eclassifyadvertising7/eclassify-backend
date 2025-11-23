/**
 * Seeder: Initial categories (Cars, Properties)
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('categories', [
    {
      name: 'Cars',
      slug: 'cars',
      description: 'Buy and sell new and used cars',
      icon: null,
      image_url: null,
      display_order: 1,
      is_featured: true,
      is_active: true,
      created_by: null,
      updated_by: null,
      deleted_by: null,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Properties',
      slug: 'properties',
      description: 'Buy, sell, and rent properties',
      icon: null,
      image_url: null,
      display_order: 2,
      is_featured: true,
      is_active: true,
      created_by: null,
      updated_by: null,
      deleted_by: null,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('categories', {
    slug: ['cars', 'properties']
  });
}
