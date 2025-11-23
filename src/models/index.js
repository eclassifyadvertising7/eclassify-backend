import sequelize from '#config/database.js';
import State from './State.js';
import City from './City.js';
import Role from './Role.js';
import Permission from './Permission.js';
import RolePermission from './RolePermission.js';
import UserModel from './User.js';
import UserProfileModel from './UserProfile.js';
import UserSessionModel from './UserSession.js';
import UserSocialAccountModel from './UserSocialAccount.js';
import SubscriptionPlanModel from './SubscriptionPlan.js';
import UserSubscriptionModel from './UserSubscription.js';
import CarBrand from './CarBrand.js';
import CarModel from './CarModel.js';
import CarVariant from './CarVariant.js';
import CarSpecification from './CarSpecification.js';

// Initialize models
const User = UserModel(sequelize);
const UserProfile = UserProfileModel(sequelize);
const UserSession = UserSessionModel(sequelize);
const UserSocialAccount = UserSocialAccountModel(sequelize);
const SubscriptionPlan = SubscriptionPlanModel(sequelize);
const UserSubscription = UserSubscriptionModel(sequelize);

const models = {
  State,
  City,
  Role,
  Permission,
  RolePermission,
  User,
  UserProfile,
  UserSession,
  UserSocialAccount,
  SubscriptionPlan,
  UserSubscription,
  CarBrand,
  CarModel,
  CarVariant,
  CarSpecification
};

// Set up associations
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

RolePermission.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});

RolePermission.belongsTo(Permission, {
  foreignKey: 'permission_id',
  as: 'permission'
});

Role.hasMany(RolePermission, {
  foreignKey: 'role_id',
  as: 'rolePermissions'
});

Permission.hasMany(RolePermission, {
  foreignKey: 'permission_id',
  as: 'rolePermissions'
});

// Location associations
State.associate(models);
City.associate(models);

// User associations
User.associate(models);
UserProfile.associate(models);
UserSession.associate(models);
UserSocialAccount.associate(models);

// SubscriptionPlan associations
SubscriptionPlan.associate(models);

// UserSubscription associations
UserSubscription.associate(models);

// Car associations
CarBrand.associate(models);
CarModel.associate(models);
CarVariant.associate(models);
CarSpecification.associate(models);

export { sequelize };
export default models;
