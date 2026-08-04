const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

class TripModel extends Model {}

TripModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    tripNumber: { type: DataTypes.STRING(30), allowNull: false, unique: true, field: 'trip_number' },
    customerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'customer_id' },
    driverId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'driver_id' },
    origin: { type: DataTypes.STRING(255), allowNull: false },
    destination: { type: DataTypes.STRING(255), allowNull: false },
    scheduledDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'scheduled_date' },
    scheduledTime: { type: DataTypes.TIME, allowNull: true, field: 'scheduled_time' },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    cargoDescription: { type: DataTypes.STRING(255), allowNull: true, field: 'cargo_description' },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    assignedAt: { type: DataTypes.DATE, allowNull: true, field: 'assigned_at' },
    startedAt: { type: DataTypes.DATE, allowNull: true, field: 'started_at' },
    completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
    createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'created_by' },
    updatedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'updated_by' },
  },
  {
    sequelize,
    modelName: 'Trip',
    tableName: 'trips',
    paranoid: true,
    underscored: true,
  }
);

module.exports = TripModel;
