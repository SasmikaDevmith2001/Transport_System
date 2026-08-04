const { sequelize } = require('../connection');
const Role = require('./Role.model');
const Permission = require('./Permission.model');
const RolePermission = require('./RolePermission.model');
const User = require('./User.model');
const RefreshToken = require('./RefreshToken.model');
const AuditLog = require('./AuditLog.model');
const Customer = require('./Customer.model');
const Driver = require('./Driver.model');
const Trip = require('./Trip.model');
const TripStop = require('./TripStop.model');

// Associations
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId' });

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Driver, { foreignKey: 'userId' });
Driver.belongsTo(User, { foreignKey: 'userId' });

Customer.hasMany(Trip, { foreignKey: 'customerId' });
Trip.belongsTo(Customer, { foreignKey: 'customerId' });

Driver.hasMany(Trip, { foreignKey: 'driverId' });
Trip.belongsTo(Driver, { foreignKey: 'driverId' });

Trip.hasMany(TripStop, { foreignKey: 'tripId', as: 'TripStops' });
TripStop.belongsTo(Trip, { foreignKey: 'tripId' });

module.exports = {
  sequelize,
  Role,
  Permission,
  RolePermission,
  User,
  RefreshToken,
  AuditLog,
  Customer,
  Driver,
  Trip,
  TripStop,
};
