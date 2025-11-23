export async function up(queryInterface, Sequelize) {
  const roles = [
    {
      id: 1,
      name: 'User',
      slug: 'user',
      description: 'External users (buyers/sellers)',
      priority: 0,
      is_system_role: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Full system access, manage roles and permissions',
      priority: 100,
      is_system_role: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Admin',
      slug: 'admin',
      description: 'Approve listings, manage users',
      priority: 80,
      is_system_role: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Accountant',
      slug: 'accountant',
      description: 'Financial management, billing, payments',
      priority: 50,
      is_system_role: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Marketing',
      slug: 'marketing',
      description: 'Feature listings, promotions',
      priority: 40,
      is_system_role: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'SEO',
      slug: 'seo',
      description: 'Content optimization, meta tags',
      priority: 30,
      is_system_role: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await queryInterface.bulkInsert('roles', roles, {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('roles', null, {});
}
