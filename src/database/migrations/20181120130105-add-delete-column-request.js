module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Requests', 'deletedAt',
    {
      allowNull: true,
      type: Sequelize.DATE
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Requests', 'deletedAt')
};
