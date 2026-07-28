'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [superAdminRole] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'SUPER_ADMIN' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const passwordHash = await bcrypt.hash('ChangeMe@123', 10);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        role_id: superAdminRole.id,
        first_name: 'System',
        last_name: 'Administrator',
        email: 'admin@anuradhatransport.lk',
        phone: null,
        password_hash: passwordHash,
        status: 'active',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@anuradhatransport.lk' }, {});
  },
};
