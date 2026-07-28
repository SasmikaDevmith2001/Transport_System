'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      { name: 'SUPER_ADMIN', description: 'Full system access', is_active: true, created_at: now, updated_at: now },
      { name: 'ADMIN', description: 'Administrative access', is_active: true, created_at: now, updated_at: now },
      { name: 'DISPATCHER', description: 'Manages trips and routes', is_active: true, created_at: now, updated_at: now },
      { name: 'DRIVER', description: 'Driver mobile/portal access', is_active: true, created_at: now, updated_at: now },
      { name: 'CUSTOMER', description: 'Customer/client access', is_active: true, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
