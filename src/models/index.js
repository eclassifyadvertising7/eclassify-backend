import sequelize from '#config/database.js';
import State from './State.js';
import District from './District.js';
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
import DataRequest from './DataRequest.js';
import Category from './Category.js';
import Listing from './Listing.js';
import CarListing from './CarListing.js';
import PropertyListing from './PropertyListing.js';
import ListingMedia from './ListingMedia.js';
import ChatRoom from './ChatRoom.js';
import ChatMessage from './ChatMessage.js';
import ListingOffer from './ListingOffer.js';
import InvoiceModel from './Invoice.js';
import TransactionModel from './Transaction.js';
import UserFavorite from './UserFavorite.js';
import UserActivityLog from './UserActivityLog.js';
import UserLocationPreference from './UserLocationPreference.js';
import UserNotification from './UserNotification.js';
import UserNotificationPreference from './UserNotificationPreference.js';
import OtherMedia from './OtherMedia.js';
import OtpVerification from './OtpVerification.js';
import ListingReport from './ListingReport.js';
import UserReport from './UserReport.js';
import UserSearch from './UserSearch.js';
import Location from './Location.js';

// Initialize models
const User = UserModel(sequelize);
const UserProfile = UserProfileModel(sequelize);
const UserSession = UserSessionModel(sequelize);
const UserSocialAccount = UserSocialAccountModel(sequelize);
const SubscriptionPlan = SubscriptionPlanModel(sequelize);
const UserSubscription = UserSubscriptionModel(sequelize);
const Invoice = InvoiceModel(sequelize);
const Transaction = TransactionModel(sequelize);

const models = {
  State,
  District,
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
  Invoice,
  Transaction,
  CarBrand,
  CarModel,
  CarVariant,
  CarSpecification,
  DataRequest,
  Category,
  Listing,
  CarListing,
  PropertyListing,
  ListingMedia,
  ChatRoom,
  ChatMessage,
  ListingOffer,
  UserFavorite,
  UserActivityLog,
  UserLocationPreference,
  UserNotification,
  UserNotificationPreference,
  OtherMedia,
  OtpVerification,
  ListingReport,
  UserReport,
  UserSearch,
  Location
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
District.associate(models);
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

// Data request associations
DataRequest.associate(models);

// Category associations
Category.associate(models);

// Listing associations
Listing.associate(models);
CarListing.associate(models);
PropertyListing.associate(models);
ListingMedia.associate(models);

// Chat associations
ChatRoom.associate(models);
ChatMessage.associate(models);
ListingOffer.associate(models);

// UserFavorite associations
UserFavorite.associate(models);

// User activity and notification associations
UserActivityLog.associate(models);
UserLocationPreference.associate(models);
UserNotification.associate(models);
UserNotificationPreference.associate(models);

// Invoice and Transaction associations
Invoice.associate(models);
Transaction.associate(models);

// OtherMedia associations
OtherMedia.associate(models);

// Report associations
ListingReport.associate(models);
UserReport.associate(models);

// UserSearch associations
UserSearch.associate(models);

// Location associations
Location.associate(models);

export { sequelize };
export default models;
