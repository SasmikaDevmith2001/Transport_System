const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

class TripStopModel extends Model {}

TripStopModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    tripId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'trip_id' },
    sequenceNo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'sequence_no' },
    locationName: { type: DataTypes.STRING(255), allowNull: false, field: 'location_name' },
    address: { type: DataTypes.STRING(255), allowNull: true },
    contactName: { type: DataTypes.STRING(100), allowNull: true, field: 'contact_name' },
    contactPhone: { type: DataTypes.STRING(20), allowNull: true, field: 'contact_phone' },
    status: {
      type: DataTypes.ENUM('pending', 'arrived', 'delivered', 'skipped'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: { type: DataTypes.STRING(255), allowNull: true },
    arrivedAt: { type: DataTypes.DATE, allowNull: true, field: 'arrived_at' },
    deliveredAt: { type: DataTypes.DATE, allowNull: true, field: 'delivered_at' },
  },
  {
    sequelize,
    modelName: 'TripStop',
    tableName: 'trip_stops',
    underscored: true,
    timestamps: true,
  }
);

module.exports = TripStopModel;
