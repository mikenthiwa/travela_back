const query = (column, approverColumn) => `select "Approvals"."id", managers.id as "managerId",
                managers."fullName" as "managerName" from "Approvals" left join
                (select "Users".id, "Users"."fullName" from "Users" inner join
                (select * from "UserRoles" where "roleId"=53019) as m on "Users"."id" = m."userId")
                as managers on managers."${column}" = "Approvals"."${approverColumn}"`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Approvals', 'approverId', 'oldApproverId');
    await queryInterface.addColumn('Approvals', 'approverId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: 'set null',
      references: {
        model: 'Users',
        key: 'id',
        as: 'manager'
      }
    });
    await queryInterface.sequelize.query(query('fullName', 'oldApproverId'),
      { type: Sequelize.QueryTypes.SELECT })
      .then((rows) => {
        rows.forEach((row) => {
          queryInterface.sequelize.query(`
          UPDATE "Approvals" SET "approverId"=${row.managerId} WHERE "id"=${row.id}
        `);
        });
      });
    await queryInterface.removeColumn('Approvals', 'oldApproverId');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Approvals', 'Approvals_approverId_fkey');
    await queryInterface.renameColumn('Approvals', 'approverId', 'newApproverId');
    await queryInterface.addColumn('Approvals', 'approverId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    const rows = await queryInterface.sequelize.query(query('id', 'newApproverId'),
      { type: Sequelize.QueryTypes.SELECT });
    await Promise.all(rows.map(row => row.managerName && queryInterface.sequelize.query(
      `UPDATE "Approvals" SET "approverId"=? WHERE "id"=${row.id}`, {
        replacements: [row.managerName]
      }
    )));
    await queryInterface.removeColumn('Approvals', 'newApproverId');
  }
};
