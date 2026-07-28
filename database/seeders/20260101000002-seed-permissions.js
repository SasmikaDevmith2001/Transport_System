'use strict';

const modules = ['users', 'roles', 'drivers', 'vehicles', 'customers', 'warehouses', 'routes', 'trips', 'deliveries', 'notifications', 'audit-logs'];
const actions = ['create', 'read', 'update', 'delete'];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = [];
    for (const mod of modules) {
      for (const action of actions) {
        rows.push({
          name: `${mod}:${action}`,
          module: mod,
          description: `${action.toUpperCase()} access to ${mod}`,
          created_at: now,
          updated_at: now,
        });
      }
    }
    await queryInterface.bulkInsert('permissions', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};
