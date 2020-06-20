module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Approvals', 'budgetStatus',
    {
      allowNull: false,
      type: Sequelize.ENUM('Open', 'Approved', 'Rejected'),
      defaultValue: 'Open',
      validate: {
        notEmpty: {
          args: true,
          msg: 'Budget status cannot be empty',
        },
      },
    }
  ),

  down: queryInterface => queryInterface.sequelize.query(
    'ALTER TABLE "Approvals" DROP COLUMN "budgetStatus"; DROP TYPE "enum_Approvals_budgetStatus";'
  )
};
