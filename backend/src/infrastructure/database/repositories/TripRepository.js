const { Op } = require('sequelize');
const ITripRepository = require('../../../domain/repositories/ITripRepository');
const Trip = require('../../../domain/entities/Trip');
const TripStop = require('../../../domain/entities/TripStop');
const {
  Trip: TripModel,
  TripStop: TripStopModel,
  Customer: CustomerModel,
  Driver: DriverModel,
  sequelize,
} = require('../sequelize/models');

function stopToDomain(instance) {
  if (!instance) return null;
  const plain = instance.get ? instance.get({ plain: true }) : instance;
  return new TripStop({
    id: plain.id,
    tripId: plain.tripId,
    sequenceNo: plain.sequenceNo,
    locationName: plain.locationName,
    address: plain.address,
    contactName: plain.contactName,
    contactPhone: plain.contactPhone,
    status: plain.status,
    notes: plain.notes,
    arrivedAt: plain.arrivedAt,
    deliveredAt: plain.deliveredAt,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  });
}

function toDomain(instance) {
  if (!instance) return null;
  const plain = instance.get({ plain: true });
  return new Trip({
    id: plain.id,
    tripNumber: plain.tripNumber,
    customerId: plain.customerId,
    driverId: plain.driverId,
    origin: plain.origin,
    destination: plain.destination,
    scheduledDate: plain.scheduledDate,
    scheduledTime: plain.scheduledTime,
    status: plain.status,
    cargoDescription: plain.cargoDescription,
    remarks: plain.remarks,
    assignedAt: plain.assignedAt,
    startedAt: plain.startedAt,
    completedAt: plain.completedAt,
    createdBy: plain.createdBy,
    updatedBy: plain.updatedBy,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    deletedAt: plain.deletedAt,
    customer: plain.Customer ? { id: plain.Customer.id, companyName: plain.Customer.companyName } : null,
    driver: plain.Driver
      ? { id: plain.Driver.id, firstName: plain.Driver.firstName, lastName: plain.Driver.lastName, phone: plain.Driver.phone }
      : null,
    stops: (plain.TripStops || []).map(stopToDomain).sort((a, b) => a.sequenceNo - b.sequenceNo),
  });
}

const INCLUDE_RELATIONS = [
  { model: CustomerModel, attributes: ['id', 'companyName'] },
  { model: DriverModel, attributes: ['id', 'firstName', 'lastName', 'phone'] },
  { model: TripStopModel, as: 'TripStops' },
];

class TripRepository extends ITripRepository {
  async findById(id) {
    const instance = await TripModel.findByPk(id, { include: INCLUDE_RELATIONS });
    return toDomain(instance);
  }

  async create(data, stops = []) {
    return sequelize.transaction(async (transaction) => {
      const instance = await TripModel.create(data, { transaction });

      if (stops.length > 0) {
        await TripStopModel.bulkCreate(
          stops.map((stop, idx) => ({ ...stop, tripId: instance.id, sequenceNo: idx + 1 })),
          { transaction }
        );
      }

      return instance.id;
    }).then((id) => this.findById(id));
  }

  async update(id, data) {
    await TripModel.update(data, { where: { id } });
    return this.findById(id);
  }

  async softDelete(id) {
    await TripModel.destroy({ where: { id } });
  }

  async replaceStops(tripId, stops = []) {
    return sequelize.transaction(async (transaction) => {
      await TripStopModel.destroy({ where: { tripId }, transaction });
      if (stops.length > 0) {
        await TripStopModel.bulkCreate(
          stops.map((stop, idx) => ({ ...stop, tripId, sequenceNo: idx + 1 })),
          { transaction }
        );
      }
    }).then(() => this.findById(tripId));
  }

  async list({ page, pageSize, offset, sortBy, sortOrder, search, status, driverId, customerId, dateFrom, dateTo }) {
    const where = {};

    if (status) where.status = status;
    if (driverId) where.driverId = driverId;
    if (customerId) where.customerId = customerId;

    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate[Op.gte] = dateFrom;
      if (dateTo) where.scheduledDate[Op.lte] = dateTo;
    }

    if (search) {
      where[Op.or] = [
        { tripNumber: { [Op.like]: `%${search}%` } },
        { origin: { [Op.like]: `%${search}%` } },
        { destination: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await TripModel.findAndCountAll({
      where,
      include: INCLUDE_RELATIONS,
      limit: pageSize,
      offset,
      order: [[sortBy, sortOrder]],
      distinct: true,
    });

    return { rows: rows.map(toDomain), total: count, page, pageSize };
  }

  async listForDriver(driverId, { page, pageSize, offset, sortBy, sortOrder, status }) {
    const where = { driverId };
    if (status) where.status = status;

    const { rows, count } = await TripModel.findAndCountAll({
      where,
      include: INCLUDE_RELATIONS,
      limit: pageSize,
      offset,
      order: [[sortBy, sortOrder]],
      distinct: true,
    });

    return { rows: rows.map(toDomain), total: count, page, pageSize };
  }

  async generateNextTripNumber() {
    const year = new Date().getFullYear();
    const prefix = `TRP-${year}-`;
    const last = await TripModel.findOne({
      where: { tripNumber: { [Op.like]: `${prefix}%` } },
      order: [['id', 'DESC']],
    });

    let nextSeq = 1;
    if (last) {
      const lastSeq = parseInt(last.tripNumber.split('-').pop(), 10);
      if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }
}

module.exports = new TripRepository();
