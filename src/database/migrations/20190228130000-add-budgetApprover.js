module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Approvals', 'budgetApprover',
    {
      type: Sequelize.STRING,
      allowNull: true
    }
  ),

  down: queryInterface => queryInterface.removeColumn('Approvals', 'budgetApprover')
};
