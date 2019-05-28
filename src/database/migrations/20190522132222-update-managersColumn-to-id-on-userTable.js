const query = (column, userColumn) => `select "Users"."id", managers.id as "managerId",
            managers."fullName" as "managerName" from "Users" left join
            (select "Users".id, "Users"."fullName" from "Users" inner join
            (select * from "UserRoles" where "roleId"=53019) as m on "Users"."id" = m."userId")
            as managers on managers."${column}" = "Users"."${userColumn}"`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Users', 'manager', 'oldManager');
    await queryInterface.addColumn('Users', 'manager', {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: 'set null',
      references: {
        model: 'Users',
        key: 'id',
        as: 'manager'
      }
    });
    await queryInterface.sequelize.query(query('fullName', 'oldManager'),
      { type: Sequelize.QueryTypes.SELECT })
      .then((rows) => {
        rows.forEach((row) => {
          queryInterface.sequelize.query(`
            UPDATE "Users" SET "manager"=${row.managerId} WHERE "id"=${row.id}
          `);
        });
      });
    await queryInterface.removeColumn('Users', 'oldManager');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Users', 'Users_manager_fkey');
    await queryInterface.renameColumn('Users', 'manager', 'newManager');
    await queryInterface.addColumn('Users', 'manager', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    const rows = await queryInterface.sequelize.query(query('id', 'newManager'),
      { type: Sequelize.QueryTypes.SELECT });
    await Promise.all(rows.map(row => row.managerName && queryInterface.sequelize.query(
      `UPDATE "Users" SET "manager"=? WHERE "id"=${row.id}`, {
        replacements: [row.managerName]
      }
    )));
    await queryInterface.removeColumn('Users', 'newManager');
  }
};
