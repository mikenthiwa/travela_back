
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Approvals', 'budgetApprovedAt',
    {
      type: Sequelize.DATE,
      allowNull: true
    },
  ),
  down: queryInterface => queryInterface.removeColumn('Approvals', 'budgetApprovedAt')
};
