module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Requests', 'budgetStatus',
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
    'ALTER TABLE "Requests" DROP COLUMN "budgetStatus"; DROP TYPE "enum_Requests_budgetStatus";'
  )
};
