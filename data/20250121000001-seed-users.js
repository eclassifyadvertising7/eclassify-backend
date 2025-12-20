import bcrypt from "bcrypt";

export async function up(queryInterface, Sequelize) {
  // Get role IDs dynamically
  const [roles] = await queryInterface.sequelize.query(
    "SELECT id, slug FROM roles WHERE slug IN ('super_admin', 'user')"
  );

  const superAdminRole = roles.find((r) => r.slug === "super_admin");
  const userRole = roles.find((r) => r.slug === "user");

  if (!superAdminRole || !userRole) {
    throw new Error(
      "Required roles (super_admin, user) not found. Please run role seeders first."
    );
  }

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("12345678", salt);
  const userHashedPassword = await bcrypt.hash("12345678", salt);

  const now = new Date();

  // Insert users
  await queryInterface.bulkInsert("users", [
    {
      country_code: "+91",
      mobile: "9175113022",
      full_name: "Abhijit Abd",
      email: "abhijit.abdagire@yopmail.com",
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
      email: "superadmin@yopmail.com",
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
      full_name: "User One",
      email: "userone@yopmail.com",
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
      full_name: "User Two",
      email: "usertwo@yopmail.com",
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
      mobile: "8002445566",
      full_name: "User Three",
      email: "userthree@yopmail.com",
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
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("users", {
    mobile: {
      [Sequelize.Op.in]: ["9175113022", "9123456789", "8002111222", "8002333444", "8002445566"],
    },
  });
}
