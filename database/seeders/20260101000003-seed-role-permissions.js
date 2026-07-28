'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query('SELECT id, name FROM roles', {
      type: Sequelize.QueryTypes.SELECT,
    });
    const permissions = await queryInterface.sequelize.query('SELECT id, name FROM permissions', {
      type: Sequelize.QueryTypes.SELECT,
    });

    const superAdmin = roles.find((r) => r.name === 'SUPER_ADMIN');
    const now = new Date();

    // SUPER_ADMIN gets every permission
    const rows = permissions.map((p) => ({
      role_id: superAdmin.id,
      permission_id: p.id,
      created_at: now,
    }));

    await queryInterface.bulkInsert('role_permissions', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  },
};
