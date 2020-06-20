module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Approvals', 'deletedAt',
    {
      allowNull: true,
      type: Sequelize.DATE
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Approvals', 'deletedAt')
};
